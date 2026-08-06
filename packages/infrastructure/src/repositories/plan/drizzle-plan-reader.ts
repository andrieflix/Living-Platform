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
import type { Logger } from "@livingsites/platform";
import type { Plan, PlanId } from "@livingsites/domain";
import type { PlanReader } from "@livingsites/application";
import type { DrizzleDB } from "../../db/drizzle-instance";
import { plans, planFeatureEntitlements, features, type PlanRow, type EntitlementRow, type FeatureRow } from "../../db/schema";
import { rowToPlan, rowsToEntitlements } from "../../db/plan-feature-mapper";

export interface DrizzlePlanReaderConfig {
  readonly db: DrizzleDB;
  readonly logger: Logger;
}

export class DrizzlePlanReader implements PlanReader {
  private readonly db: DrizzleDB;
  private readonly logger: Logger;

  constructor(config: DrizzlePlanReaderConfig) {
    this.db = config.db;
    this.logger = config.logger;
  }

  async findById(id: PlanId): Promise<Plan | null> {
    try {
      const rows = await this.db.select().from(plans).where(eq(plans.id, String(id)));
      return await this.reconstructPlan(rows[0] ?? null);
    } catch (err) {
      this.logger.error("PlanReader.findById failed", { id: String(id), error: String(err) });
      return null;
    }
  }

  async findActiveById(id: PlanId): Promise<Plan | null> {
    try {
      const rows = await this.db
        .select()
        .from(plans)
        .where(and(eq(plans.id, String(id)), eq(plans.is_active, true)));
      return await this.reconstructPlan(rows[0] ?? null);
    } catch (err) {
      this.logger.error("PlanReader.findActiveById failed", { id: String(id), error: String(err) });
      return null;
    }
  }

  async listActive(): Promise<Plan[]> {
    try {
      const rows = await this.db.select().from(plans).where(eq(plans.is_active, true));
      const results: Plan[] = [];
      for (const row of rows) {
        const plan = await this.reconstructPlan(row);
        if (plan !== null) results.push(plan);
      }
      return results;
    } catch (err) {
      this.logger.error("PlanReader.listActive failed", { error: String(err) });
      return [];
    }
  }

  private async reconstructPlan(row: PlanRow | null): Promise<Plan | null> {
    if (!row) return null;

    let entitlementRows: EntitlementRow[] = [];
    let featureRows: FeatureRow[] = [];
    try {
      entitlementRows = await this.db
        .select()
        .from(planFeatureEntitlements)
        .where(eq(planFeatureEntitlements.plan_id, row.id));
      const featureIds = entitlementRows.map((e) => e.feature_id);
      if (featureIds.length > 0) {
        const featureResult = await this.db.select().from(features);
        featureRows = featureResult.filter((f: typeof featureResult[number]) => featureIds.includes(f.id));
      }
    } catch (err) {
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
