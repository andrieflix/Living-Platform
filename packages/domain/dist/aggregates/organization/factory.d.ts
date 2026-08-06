/**
 * Pure Organization draft factory — Domain layer.
 *
 * Accepts already-resolved domain values (ID, timestamp, etc.) and returns
 * a valid OrganizationDraft. No I/O, no runtime contracts, no Platform
 * imports. The Application layer resolves the ID and timestamp through
 * injected ports and passes them here.
 */
import type { OrganizationId, PlanId, Slug, ISODateString } from "../../shared";
import type { OrganizationDraft, DraftVersion } from "./draft";
export interface CreateOrganizationDraftInput {
    readonly id: OrganizationId;
    readonly name: string;
    readonly slug: Slug;
    readonly billingEmail: string;
    readonly planId: PlanId | null;
    readonly now: ISODateString;
}
export declare function createOrganizationDraft(input: CreateOrganizationDraftInput): OrganizationDraft;
export type { DraftVersion };
//# sourceMappingURL=factory.d.ts.map