/**
 * Persistence mapper between database plan/feature/entitlement rows and
 * Domain Plan/Feature/FeatureEntitlement contracts.
 *
 * Private to Infrastructure. Never leaked outside. Reconstructs branded
 * IDs, validates required persisted fields, and rejects impossible
 * database state with InvalidPersistenceStateError.
 */
import type {
  Plan,
  Feature,
  FeatureEntitlement,
  PlanId,
  FeatureId,
  MachineKey,
  ISODateString,
  AuditTrail,
  AggregateVersion,
  PlanTier,
  FeatureCategory,
} from "@livingsites/domain";
import type { PlanRow, FeatureRow, EntitlementRow } from "./schema";
import type { InvalidPersistenceStateError } from "@livingsites/application";

export type PlanMapperError = InvalidPersistenceStateError;

function asPlanId(id: string): PlanId {
  return id as PlanId;
}

function asFeatureId(id: string): FeatureId {
  return id as FeatureId;
}

function asMachineKey(key: string): MachineKey {
  return key as MachineKey;
}

function asISODateString(ts: string | Date): ISODateString {
  return (ts instanceof Date ? ts.toISOString() : ts) as ISODateString;
}

export function rowToPlan(
  row: PlanRow,
  entitlements: readonly FeatureEntitlement[],
): { ok: true; value: Plan } | { ok: false; error: PlanMapperError } {
  if (!row.id) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Plan row missing id." } };
  }
  if (!row.slug) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Plan row missing slug." } };
  }
  if (row.version < 1) {
    return { ok: false, error: { code: "invalid_persistence_state", message: `Plan row has invalid version: ${row.version}.` } };
  }

  const audit: AuditTrail = {
    createdAt: asISODateString(row.created_at),
    updatedAt: asISODateString(row.updated_at),
    ...(row.created_by !== null ? { createdBy: row.created_by as import("@livingsites/domain").UserId } : {}),
    ...(row.updated_by !== null ? { updatedBy: row.updated_by as import("@livingsites/domain").UserId } : {}),
  };

  const plan: Plan = {
    id: asPlanId(row.id),
    tier: row.tier as `${PlanTier}`,
    name: row.name,
    ...(row.description !== null ? { description: row.description } : {}),
    priceMonthly: row.price_monthly,
    priceAnnual: row.price_annual,
    currency: row.currency,
    features: entitlements,
    maxWebsites: row.max_websites,
    maxMembers: row.max_members,
    customDomainsAllowed: row.custom_domains_allowed,
    isActive: row.is_active,
    version: row.version as AggregateVersion,
    audit,
  };

  return { ok: true, value: plan };
}

export function rowToFeature(
  row: FeatureRow,
): { ok: true; value: Feature } | { ok: false; error: PlanMapperError } {
  if (!row.id) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Feature row missing id." } };
  }
  if (!row.key) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Feature row missing key." } };
  }
  if (row.version < 1) {
    return { ok: false, error: { code: "invalid_persistence_state", message: `Feature row has invalid version: ${row.version}.` } };
  }

  const feature: Feature = {
    id: asFeatureId(row.id),
    key: asMachineKey(row.key),
    category: row.category as `${FeatureCategory}`,
    name: row.name,
    ...(row.description !== null ? { description: row.description } : {}),
    valueType: row.value_type as "boolean" | "number",
    isActive: row.is_active,
    version: row.version as AggregateVersion,
  };

  return { ok: true, value: feature };
}

export function rowsToEntitlements(
  entitlementRows: readonly EntitlementRow[],
  featureRows: readonly FeatureRow[],
): { ok: true; value: FeatureEntitlement[] } | { ok: false; error: PlanMapperError } {
  const featureMap = new Map<string, FeatureRow>();
  for (const fr of featureRows) {
    featureMap.set(fr.id, fr);
  }

  const entitlements: FeatureEntitlement[] = [];
  for (const er of entitlementRows) {
    const featureRow = featureMap.get(er.feature_id);
    if (!featureRow) {
      return {
        ok: false,
        error: {
          code: "invalid_persistence_state",
          message: `Entitlement ${er.id} references missing feature ${er.feature_id}.`,
        },
      };
    }
    entitlements.push({
      featureId: asFeatureId(featureRow.id),
      value: Number(er.value),
    });
  }

  return { ok: true, value: entitlements };
}
