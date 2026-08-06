/**
 * Persistence mapper between database organization rows and Domain aggregates.
 *
 * Private to Infrastructure. Never leaked outside. Reconstructs branded IDs,
 * validates required persisted fields, and rejects impossible database state
 * with InvalidPersistenceStateError.
 */
import type {
  Organization,
  OrganizationDraft,
  OrganizationId,
  PlanId,
  FeatureId,
  Slug,
  ISODateString,
  AuditTrail,
  AggregateVersion,
  FeatureOverride,
} from "@livingsites/domain";
import type { OrganizationRow } from "./schema";
import type { InvalidPersistenceStateError } from "@livingsites/application";

export type MapperError = InvalidPersistenceStateError;

function asOrganizationId(id: string): OrganizationId {
  return id as OrganizationId;
}

function asPlanId(id: string): PlanId {
  return id as PlanId;
}

function asFeatureId(id: string): FeatureId {
  return id as FeatureId;
}

function asSlug(slug: string): Slug {
  return slug as Slug;
}

function asISODateString(ts: string): ISODateString {
  return ts as ISODateString;
}

export function rowToOrganization(row: OrganizationRow): { ok: true; value: Organization } | { ok: false; error: MapperError } {
  if (!row.id) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Organization row missing id." } };
  }
  if (!row.slug) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Organization row missing slug." } };
  }
  if (row.version < 1) {
    return { ok: false, error: { code: "invalid_persistence_state", message: `Organization row has invalid version: ${row.version}.` } };
  }

  let featureOverrides: FeatureOverride[] = [];
  try {
    const parsed = JSON.parse(row.feature_overrides) as unknown;
    if (Array.isArray(parsed)) {
      featureOverrides = (parsed as Array<Record<string, unknown>>).map((o) => ({
        featureId: asFeatureId(String(o.featureId)),
        value: Number(o.value),
        enabled: Boolean(o.enabled),
        ...(o.reason !== undefined ? { reason: String(o.reason) } : {}),
        appliedAt: asISODateString(String(o.appliedAt)),
      }));
    }
  } catch {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Organization row has invalid feature_overrides JSON." } };
  }

  const audit: AuditTrail = {
    createdAt: asISODateString(row.created_at.toISOString()),
    updatedAt: asISODateString(row.updated_at.toISOString()),
    ...(row.created_by !== null ? { createdBy: row.created_by as import("@livingsites/domain").UserId } : {}),
    ...(row.updated_by !== null ? { updatedBy: row.updated_by as import("@livingsites/domain").UserId } : {}),
  };

  const org: Organization = {
    id: asOrganizationId(row.id),
    slug: asSlug(row.slug),
    name: row.name,
    billingEmail: row.billing_email,
    planId: row.plan_id !== null ? asPlanId(row.plan_id) : null,
    status: row.status as "active" | "archived" | "deleted",
    featureOverrides,
    version: row.version as AggregateVersion,
    audit,
  };

  return { ok: true, value: org };
}

export interface OrganizationInsertData {
  id: string;
  name: string;
  slug: string;
  billing_email: string;
  plan_id: string | null;
  status: string;
  feature_overrides: string;
  version: number;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: Date | null;
}

export function draftToInsertData(draft: OrganizationDraft, persistedVersion: number): OrganizationInsertData {
  return {
    id: String(draft.id),
    name: draft.name,
    slug: String(draft.slug),
    billing_email: draft.billingEmail,
    plan_id: draft.planId !== null ? String(draft.planId) : null,
    status: draft.status,
    feature_overrides: JSON.stringify(draft.featureOverrides),
    version: persistedVersion,
    created_at: new Date(draft.audit.createdAt),
    updated_at: new Date(draft.audit.updatedAt),
    created_by: draft.audit.createdBy !== undefined ? String(draft.audit.createdBy) : null,
    updated_by: draft.audit.updatedBy !== undefined ? String(draft.audit.updatedBy) : null,
    deleted_at: null,
  };
}
