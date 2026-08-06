/**
 * Persistence mapper between database plan/feature/entitlement rows and
 * Domain Plan/Feature/FeatureEntitlement contracts.
 *
 * Private to Infrastructure. Never leaked outside. Reconstructs branded
 * IDs, validates required persisted fields, and rejects impossible
 * database state with InvalidPersistenceStateError.
 */
import type { Plan, Feature, FeatureEntitlement } from "@livingsites/domain";
import type { PlanRow, FeatureRow, EntitlementRow } from "./schema";
import type { InvalidPersistenceStateError } from "@livingsites/application";
export type PlanMapperError = InvalidPersistenceStateError;
export declare function rowToPlan(row: PlanRow, entitlements: readonly FeatureEntitlement[]): {
    ok: true;
    value: Plan;
} | {
    ok: false;
    error: PlanMapperError;
};
export declare function rowToFeature(row: FeatureRow): {
    ok: true;
    value: Feature;
} | {
    ok: false;
    error: PlanMapperError;
};
export declare function rowsToEntitlements(entitlementRows: readonly EntitlementRow[], featureRows: readonly FeatureRow[]): {
    ok: true;
    value: FeatureEntitlement[];
} | {
    ok: false;
    error: PlanMapperError;
};
//# sourceMappingURL=plan-feature-mapper.d.ts.map