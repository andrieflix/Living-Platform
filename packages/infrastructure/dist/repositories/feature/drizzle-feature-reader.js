/**
 * Drizzle-backed Feature reader implementation.
 *
 * Implements FeatureReader (read-only). Does not implement FeatureRepository
 * mutation methods — those are not needed by CreateOrganization.
 *
 * - maps database rows to Domain Feature contracts;
 * - reconstructs branded IDs and AggregateVersion;
 * - rejects malformed persisted state with InvalidPersistenceStateError;
 * - maps connection failures to null (logged);
 * - exposes no raw Drizzle or PostgreSQL errors;
 * - row and insert types are private.
 */
import { eq } from "drizzle-orm";
import { features, planFeatureEntitlements } from "../../db/schema";
import { rowToFeature } from "../../db/plan-feature-mapper";
export class DrizzleFeatureReader {
    db;
    logger;
    constructor(config) {
        this.db = config.db;
        this.logger = config.logger;
    }
    async findById(id) {
        try {
            const rows = await this.db.select().from(features).where(eq(features.id, String(id)));
            return this.reconstructFeature(rows[0] ?? null);
        }
        catch (err) {
            this.logger.error("FeatureReader.findById failed", { id: String(id), error: String(err) });
            return null;
        }
    }
    async findByKey(key) {
        try {
            const rows = await this.db.select().from(features).where(eq(features.key, key));
            return this.reconstructFeature(rows[0] ?? null);
        }
        catch (err) {
            this.logger.error("FeatureReader.findByKey failed", { key, error: String(err) });
            return null;
        }
    }
    async listForPlan(planId) {
        try {
            const entitlementRows = await this.db
                .select()
                .from(planFeatureEntitlements)
                .where(eq(planFeatureEntitlements.plan_id, String(planId)));
            if (entitlementRows.length === 0)
                return [];
            const featureIds = entitlementRows.map((e) => e.feature_id);
            const allFeatures = await this.db.select().from(features);
            const planFeatures = allFeatures.filter((f) => featureIds.includes(f.id));
            const results = [];
            for (const row of planFeatures) {
                const mapped = this.reconstructFeature(row);
                if (mapped !== null)
                    results.push(mapped);
            }
            return results;
        }
        catch (err) {
            this.logger.error("FeatureReader.listForPlan failed", { planId: String(planId), error: String(err) });
            return [];
        }
    }
    reconstructFeature(row) {
        if (!row)
            return null;
        const mapped = rowToFeature(row);
        if (!mapped.ok) {
            this.logger.error("FeatureReader: failed to map feature row", { featureId: row.id, error: mapped.error.message });
            return null;
        }
        return mapped.value;
    }
}
//# sourceMappingURL=drizzle-feature-reader.js.map