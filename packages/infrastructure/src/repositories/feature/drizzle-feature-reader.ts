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
import type { Logger } from "@livingsites/platform";
import type { Feature, FeatureId, PlanId } from "@livingsites/domain";
import type { FeatureReader } from "@livingsites/application";
import type { DrizzleDB } from "../../db/drizzle-instance";
import { features, planFeatureEntitlements, type FeatureRow } from "../../db/schema";
import { rowToFeature } from "../../db/plan-feature-mapper";

export interface DrizzleFeatureReaderConfig {
  readonly db: DrizzleDB;
  readonly logger: Logger;
}

export class DrizzleFeatureReader implements FeatureReader {
  private readonly db: DrizzleDB;
  private readonly logger: Logger;

  constructor(config: DrizzleFeatureReaderConfig) {
    this.db = config.db;
    this.logger = config.logger;
  }

  async findById(id: FeatureId): Promise<Feature | null> {
    try {
      const rows = await this.db.select().from(features).where(eq(features.id, String(id)));
      return this.reconstructFeature(rows[0] ?? null);
    } catch (err) {
      this.logger.error("FeatureReader.findById failed", { id: String(id), error: String(err) });
      return null;
    }
  }

  async findByKey(key: string): Promise<Feature | null> {
    try {
      const rows = await this.db.select().from(features).where(eq(features.key, key));
      return this.reconstructFeature(rows[0] ?? null);
    } catch (err) {
      this.logger.error("FeatureReader.findByKey failed", { key, error: String(err) });
      return null;
    }
  }

  async listForPlan(planId: PlanId): Promise<Feature[]> {
    try {
      const entitlementRows = await this.db
        .select()
        .from(planFeatureEntitlements)
        .where(eq(planFeatureEntitlements.plan_id, String(planId)));

      if (entitlementRows.length === 0) return [];

      const featureIds = entitlementRows.map((e: typeof entitlementRows[number]) => e.feature_id);
      const allFeatures = await this.db.select().from(features);
      const planFeatures = allFeatures.filter((f: typeof allFeatures[number]) => featureIds.includes(f.id));

      const results: Feature[] = [];
      for (const row of planFeatures) {
        const mapped = this.reconstructFeature(row);
        if (mapped !== null) results.push(mapped);
      }
      return results;
    } catch (err) {
      this.logger.error("FeatureReader.listForPlan failed", { planId: String(planId), error: String(err) });
      return [];
    }
  }

  private reconstructFeature(row: FeatureRow | null): Feature | null {
    if (!row) return null;
    const mapped = rowToFeature(row);
    if (!mapped.ok) {
      this.logger.error("FeatureReader: failed to map feature row", { featureId: row.id, error: mapped.error.message });
      return null;
    }
    return mapped.value;
  }
}
