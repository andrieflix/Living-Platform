/**
 * DrizzleOrganizationCreationPersistence — atomic Organization creation
 * with durable event publication.
 *
 * Inserts the Organization row and the OrganizationCreated outbox record
 * in a single database transaction. Either both commit or neither commits.
 * A duplicate slug produces no outbox record. Each successful creation
 * produces exactly one outbox record.
 *
 * This port replaces the separate create + publish flow for production
 * database-backed execution. The use case calls this port when durable
 * transactional behavior is required.
 */
import { randomUUID } from "node:crypto";
import { organizations, applicationOutbox } from "../../db/schema";
import { rowToOrganization, draftToInsertData } from "../../db/organization-mapper";
import { buildOutboxInsert } from "../../db/outbox-mapper";
function isDuplicateKeyError(err) {
    if (err && typeof err === "object" && "code" in err) {
        return err.code === "23505";
    }
    return false;
}
function isConnectionError(err) {
    if (err && typeof err === "object") {
        const e = err;
        if (e.code === "ECONNREFUSED" || e.code === "ETIMEDOUT" || e.code === "ENOTFOUND") {
            return true;
        }
        if (typeof e.message === "string" && /connection|timeout|unreachable/i.test(e.message)) {
            return true;
        }
    }
    return false;
}
export class DrizzleOrganizationCreationPersistence {
    db;
    logger;
    schemaVersion;
    constructor(config) {
        this.db = config.db;
        this.logger = config.logger;
        this.schemaVersion = config.schemaVersion ?? "1.0.0";
    }
    async createWithEvent(draft, event) {
        try {
            const result = await this.db.transaction(async (tx) => {
                const insertData = draftToInsertData(draft, 1);
                const [inserted] = await tx
                    .insert(organizations)
                    .values({
                    id: insertData.id,
                    name: insertData.name,
                    slug: insertData.slug,
                    billing_email: insertData.billing_email,
                    plan_id: insertData.plan_id,
                    status: insertData.status,
                    feature_overrides: insertData.feature_overrides,
                    version: insertData.version,
                    created_at: insertData.created_at,
                    updated_at: insertData.updated_at,
                    created_by: insertData.created_by,
                    updated_by: insertData.updated_by,
                    deleted_at: insertData.deleted_at,
                })
                    .returning();
                if (!inserted) {
                    throw new CreateRepoErrorException({
                        code: "invalid_persistence_state",
                        message: "Insert returned no row.",
                    });
                }
                const mapped = rowToOrganization(inserted);
                if (!mapped.ok) {
                    throw new CreateRepoErrorException(mapped.error);
                }
                const eventId = randomUUID();
                const idempotencyKey = `organization.created:${String(mapped.value.id)}`;
                const outboxInsert = buildOutboxInsert({
                    id: eventId,
                    eventType: event.type,
                    aggregateType: "organization",
                    aggregateId: String(mapped.value.id),
                    organizationId: String(mapped.value.id),
                    websiteId: null,
                    payload: {
                        type: event.type,
                        occurredAt: event.occurredAt,
                        organizationId: String(event.organizationId),
                        slug: event.slug,
                        planId: event.planId,
                    },
                    occurredAt: new Date(event.occurredAt),
                    idempotencyKey,
                    schemaVersion: this.schemaVersion,
                });
                await tx.insert(applicationOutbox).values(outboxInsert);
                return mapped.value;
            });
            return { ok: true, value: result };
        }
        catch (err) {
            if (err instanceof CreateRepoErrorException) {
                return { ok: false, error: err.error };
            }
            return this.mapCreateError(err, String(draft.slug));
        }
    }
    mapCreateError(err, slug) {
        if (isDuplicateKeyError(err)) {
            return {
                ok: false,
                error: {
                    code: "duplicate_key",
                    message: `An organization with slug "${slug}" already exists.`,
                    field: "slug",
                    value: slug,
                },
            };
        }
        if (isConnectionError(err)) {
            return {
                ok: false,
                error: { code: "persistence_unavailable", message: "Database connection error during create." },
            };
        }
        this.logger.error("Unexpected createWithEvent error", { error: String(err) });
        return {
            ok: false,
            error: { code: "invalid_persistence_state", message: `Create failed: ${String(err)}` },
        };
    }
}
class CreateRepoErrorException extends Error {
    error;
    constructor(error) {
        super(error.message);
        this.name = "CreateRepoErrorException";
        this.error = error;
    }
}
//# sourceMappingURL=drizzle-organization-creation-persistence.js.map