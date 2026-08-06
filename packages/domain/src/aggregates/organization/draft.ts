/**
 * OrganizationDraft — a valid aggregate before first persistence.
 *
 * Distinct from a persisted Organization. The repository create method
 * accepts an OrganizationDraft and returns an Organization at version 1.
 * These two types are not interchangeable.
 *
 * The __draft brand on the version field makes OrganizationDraft structurally
 * incompatible with Organization at the TypeScript level.
 */
import type {
  OrganizationId,
  PlanId,
  Slug,
  AuditTrail,
  LifecycleStatus,
  AggregateVersion,
} from "../../shared";
import { INITIAL_AGGREGATE_VERSION } from "../../shared";
import type { FeatureOverride } from "../../organization/types";

export type DraftVersion = AggregateVersion & { readonly __draft: true };

export interface OrganizationDraft {
  readonly id: OrganizationId;
  readonly slug: Slug;
  name: string;
  billingEmail: string;
  planId: PlanId | null;
  status: LifecycleStatus;
  featureOverrides: readonly FeatureOverride[];
  readonly version: DraftVersion;
  readonly audit: AuditTrail;
}

export const DRAFT_VERSION: DraftVersion = INITIAL_AGGREGATE_VERSION as DraftVersion;
