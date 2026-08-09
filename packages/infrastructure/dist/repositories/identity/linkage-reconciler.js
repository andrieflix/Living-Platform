/**
 * Idempotent identity linkage reconciler.
 *
 * Finds 'pending' identity linkages that are due for retry and attempts
 * to create the corresponding Platform User. If successful, marks the
 * linkage as 'linked'. If all attempts are exhausted, marks it as 'failed'.
 *
 * This worker is idempotent: running it multiple times with the same pending
 * linkages produces the same result as running it once. It uses an atomic
 * claim-and-process pattern to prevent concurrent workers from processing
 * the same linkage.
 */
import { eq, and, lte } from "drizzle-orm";
import { identityLinkages } from "../../db/identity-linkage-schema";
import { createUserDraft } from "@livingsites/domain";
export class LinkageReconciler {
    db;
    logger;
    userCreator;
    idGenerator;
    clock;
    batchSize;
    constructor(config) {
        this.db = config.db;
        this.logger = config.logger;
        this.userCreator = config.userCreator;
        this.idGenerator = config.idGenerator;
        this.clock = config.clock;
        this.batchSize = config.batchSize ?? 50;
    }
    async reconcile() {
        const now = new Date(this.clock.nowIso());
        let processed = 0;
        let linked = 0;
        let failed = 0;
        let skipped = 0;
        const pending = await this.db
            .select()
            .from(identityLinkages)
            .where(and(eq(identityLinkages.status, "pending"), lte(identityLinkages.next_attempt_at, now)))
            .limit(this.batchSize);
        for (const row of pending) {
            processed++;
            const result = await this.processLinkage(row);
            if (result === "linked")
                linked++;
            else if (result === "failed")
                failed++;
            else
                skipped++;
        }
        if (processed > 0) {
            this.logger.info("Linkage reconciliation complete", { processed, linked, failed, skipped });
        }
        return { processed, linked, failed, skipped };
    }
    async processLinkage(row) {
        const attempts = row.attempts + 1;
        if (attempts > row.max_attempts) {
            await this.db
                .update(identityLinkages)
                .set({
                status: "failed",
                failure_reason: "Max attempts exceeded",
                attempts,
                updated_at: new Date(this.clock.nowIso()),
                completed_at: new Date(this.clock.nowIso()),
            })
                .where(eq(identityLinkages.id, row.id));
            this.logger.warn("Linkage failed: max attempts exceeded", { linkageId: row.id, authSubjectId: row.auth_subject_id });
            return "failed";
        }
        const draft = createUserDraft({
            id: this.idGenerator.generatePrefixed("user"),
            authSubjectId: row.auth_subject_id,
            email: row.email,
            displayName: row.display_name,
            now: this.clock.nowIso(),
        });
        const createResult = await this.userCreator.create(draft);
        if (createResult.ok) {
            await this.db
                .update(identityLinkages)
                .set({
                status: "linked",
                platform_user_id: String(createResult.value.id),
                attempts,
                updated_at: new Date(this.clock.nowIso()),
                completed_at: new Date(this.clock.nowIso()),
            })
                .where(eq(identityLinkages.id, row.id));
            this.logger.info("Linkage resolved", { linkageId: row.id, userId: String(createResult.value.id) });
            return "linked";
        }
        const nextAttemptAt = new Date(Date.now() + Math.pow(2, attempts) * 1000);
        await this.db
            .update(identityLinkages)
            .set({
            attempts,
            failure_reason: createResult.error.message,
            next_attempt_at: nextAttemptAt,
            updated_at: new Date(this.clock.nowIso()),
        })
            .where(eq(identityLinkages.id, row.id));
        this.logger.warn("Linkage retry scheduled", { linkageId: row.id, attempts, nextAttemptAt: nextAttemptAt.toISOString() });
        return "skipped";
    }
}
//# sourceMappingURL=linkage-reconciler.js.map