/**
 * Organization bounded context — the top of the tenant hierarchy.
 *
 * Invariant: every other entity in the platform ultimately resolves up to
 * exactly one Organization. An Organization owns many Websites; a Website
 * cannot exist without an Organization.
 */
import type {
  OrganizationId,
  PlanId,
  FeatureId,
  Slug,
  MachineKey,
  ISODateString,
  AuditTrail,
  LifecycleStatus,
  AggregateVersion,
} from "../shared";

/** A single commercial tenant on the platform. */
export interface Organization {
  readonly id: OrganizationId;
  readonly slug: Slug;
  /** Display name, e.g. "Tajon Construction". */
  name: string;
  /** Optional public-facing brand description. */
  description?: string;
  /** Contact email for billing and platform notifications. */
  billingEmail: string;
  /** Current subscription plan; null while trialing with no plan selected. */
  planId: PlanId | null;
  status: LifecycleStatus;
  /** Feature overrides applied on top of the plan's baseline. */
  featureOverrides: readonly FeatureOverride[];
  /** Optimistic concurrency version. Monotonically incremented on each save. */
  version: AggregateVersion;
  readonly audit: AuditTrail;
}

/**
 * A platform-level subscription tier (Starter, Pro, Business, Enterprise).
 * Plans are platform-global, never organization-specific.
 */
export interface Plan {
  readonly id: PlanId;
  tier: PlanTierValue;
  name: string;
  description?: string;
  /** Monthly price in the smallest currency unit (e.g. cents). */
  priceMonthly: number;
  /** Annual price in the smallest currency unit. */
  priceAnnual: number;
  currency: string;
  /** Features granted to every organization on this plan. */
  features: readonly FeatureEntitlement[];
  /** Maximum number of websites allowed. null = unlimited. */
  maxWebsites: number | null;
  /** Maximum number of members per organization. null = unlimited. */
  maxMembers: number | null;
  /** Whether websites may publish to custom domains. */
  customDomainsAllowed: boolean;
  isActive: boolean;
  /** Optimistic concurrency version. Monotonically incremented on each save. */
  version: AggregateVersion;
  readonly audit: AuditTrail;
}

/**
 * A discrete capability or limit that can be granted by a Plan or overridden
 * per Organization. Feature keys are platform-defined and stable.
 */
export interface Feature {
  readonly id: FeatureId;
  readonly key: MachineKey;
  category: FeatureCategoryValue;
  /** Human-readable name shown in billing/admin surfaces. */
  name: string;
  description?: string;
  /** Datatype of the feature's numeric/boolean value. */
  valueType: "boolean" | "number";
  isActive: boolean;
  /** Optimistic concurrency version. Monotonically incremented on each save. */
  version: AggregateVersion;
}

/**
 * An entitlement line on a Plan: grants a Feature with a specific value.
 */
export interface FeatureEntitlement {
  readonly featureId: FeatureId;
  /** Boolean flags use 1/0; numeric limits use the raw number. */
  value: number;
}

/**
 * Per-organization override of a plan entitlement. Overrides win over the
 * plan baseline. Stored on the Organization, not the Plan.
 */
export interface FeatureOverride {
  readonly featureId: FeatureId;
  value: number;
  /** Whether this override grants (true) or denies (false) the feature. */
  enabled: boolean;
  /** Free-text reason for auditability, e.g. "custom enterprise deal". */
  reason?: string;
  readonly appliedAt: ISODateString;
}

/** Re-export the OrganizationDraft from the aggregates folder. */
export type { OrganizationDraft, DraftVersion } from "../aggregates/organization/draft";

/** Subset of FeatureCategory scoped to this context for re-export convenience. */
import type { FeatureCategory } from "../shared";
type FeatureCategoryValue = `${FeatureCategory}`;
import type { PlanTier } from "../shared";
type PlanTierValue = `${PlanTier}`;
