/**
 * Drizzle-backed Plan reader implementation.
 *
 * Implements PlanReader (read-only). Does not implement PlanRepository
 * mutation methods — those are not needed by CreateOrganization.
 *
 * - maps database rows to Domain Plan contracts;
 * - reconstructs branded IDs and AggregateVersion;
 * - rejects malformed persisted state with InvalidPersistenceStateError;
 * - maps connection failures to null (logged);
 * - exposes no raw Drizzle or PostgreSQL errors;
 * - row and insert types are private.
 */
import { eq, and } from "drizzle-orm";
import { plans, planFeatureEntitlements, features } from "../../db/schema";
import { rowToPlan, rowsToEntitlements } from "../../db/plan-feature-mapper";
export class DrizzlePlanReader {
    db;
    logger;
    constructor(config) {
        this.db = config.db;
        this.logger = config.logger;
    }
    async findById(id) {
        try {
            const rows = await this.db.select().from(plans).where(eq(plans.id, String(id)));
            return await this.reconstructPlan(rows[0] ?? null);
        }
        catch (err) {
            this.logger.error("PlanReader.findById failed", { id: String(id), error: String(err) });
            return null;
        }
    }
    async findActiveById(id) {
        try {
            const rows = await this.db
                .select()
                .from(plans)
                .where(and(eq(plans.id, String(id)), eq(plans.is_active, true)));
            return await this.reconstructPlan(rows[0] ?? null);
        }
        catch (err) {
            this.logger.error("PlanReader.findActiveById failed", { id: String(id), error: String(err) });
            return null;
        }
    }
    async listActive() {
        try {
            const rows = await this.db.select().from(plans).where(eq(plans.is_active, true));
            const results = [];
            for (const row of rows) {
                const plan = await this.reconstructPlan(row);
                if (plan !== null)
                    results.push(plan);
            }
            return results;
        }
        catch (err) {
            this.logger.error("PlanReader.listActive failed", { error: String(err) });
            return [];
        }
    }
    async reconstructPlan(row) {
        if (!row)
            return null;
        let entitlementRows = [];
        let featureRows = [];
        try {
            entitlementRows = await this.db
                .select()
                .from(planFeatureEntitlements)
                .where(eq(planFeatureEntitlements.plan_id, row.id));
            const featureIds = entitlementRows.map((e) => e.feature_id);
            if (featureIds.length > 0) {
                const featureResult = await this.db.select().from(features);
                featureRows = featureResult.filter((f) => featureIds.includes(f.id));
            }
        }
        catch (err) {
            this.logger.error("PlanReader: failed to load entitlements", { planId: row.id, error: String(err) });
            return null;
        }
        const entitlementsResult = rowsToEntitlements(entitlementRows, featureRows);
        if (!entitlementsResult.ok) {
            this.logger.error("PlanReader: failed to map entitlements", { planId: row.id, error: entitlementsResult.error.message });
            return null;
        }
        const mapped = rowToPlan(row, entitlementsResult.value);
        if (!mapped.ok) {
            this.logger.error("PlanReader: failed to map plan row", { planId: row.id, error: mapped.error.message });
            return null;
        }
        return mapped.value;
    }
}
//# sourceMappingURL=drizzle-plan-reader.js.map