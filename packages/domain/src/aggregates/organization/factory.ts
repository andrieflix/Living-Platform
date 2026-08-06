/**
 * Pure Organization draft factory — Domain layer.
 *
 * Accepts already-resolved domain values (ID, timestamp, etc.) and returns
 * a valid OrganizationDraft. No I/O, no runtime contracts, no Platform
 * imports. The Application layer resolves the ID and timestamp through
 * injected ports and passes them here.
 */
import type {
  OrganizationId,
  PlanId,
  Slug,
  ISODateString,
  AuditTrail,
  LifecycleStatus,
} from "../../shared";
import type { OrganizationDraft, DraftVersion } from "./draft";
import { DRAFT_VERSION } from "./draft";

export interface CreateOrganizationDraftInput {
  readonly id: OrganizationId;
  readonly name: string;
  readonly slug: Slug;
  readonly billingEmail: string;
  readonly planId: PlanId | null;
  readonly now: ISODateString;
}

export function createOrganizationDraft(input: CreateOrganizationDraftInput): OrganizationDraft {
  const audit: AuditTrail = {
    createdAt: input.now,
    updatedAt: input.now,
  };

  return {
    id: input.id,
    slug: input.slug,
    name: input.name,
    billingEmail: input.billingEmail,
    planId: input.planId,
    status: "active" as LifecycleStatus,
    featureOverrides: [],
    version: DRAFT_VERSION,
    audit,
  };
}

export type { DraftVersion };
