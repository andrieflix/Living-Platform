/**
 * Persistence mapper between database organization rows and Domain aggregates.
 *
 * Private to Infrastructure. Never leaked outside. Reconstructs branded IDs,
 * validates required persisted fields, and rejects impossible database state
 * with InvalidPersistenceStateError.
 */
import type { Organization, OrganizationDraft } from "@livingsites/domain";
import type { OrganizationRow } from "./schema";
import type { InvalidPersistenceStateError } from "@livingsites/application";
export type MapperError = InvalidPersistenceStateError;
export declare function rowToOrganization(row: OrganizationRow): {
    ok: true;
    value: Organization;
} | {
    ok: false;
    error: MapperError;
};
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
export declare function draftToInsertData(draft: OrganizationDraft, persistedVersion: number): OrganizationInsertData;
//# sourceMappingURL=organization-mapper.d.ts.map