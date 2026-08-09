/**
 * Persistence mapper between database platform_users rows and Domain User aggregates.
 *
 * Private to Infrastructure. Never leaked outside. Reconstructs branded IDs,
 * validates required persisted fields, and rejects impossible database state
 * with InvalidPersistenceStateError.
 */
import type { User } from "@livingsites/domain";
import type { platformUsers } from "./schema";
import type { InvalidPersistenceStateError } from "@livingsites/application";
type PlatformUserRow = typeof platformUsers.$inferSelect;
export type UserMapperError = InvalidPersistenceStateError;
export declare function rowToUser(row: PlatformUserRow): {
    ok: true;
    value: User;
} | {
    ok: false;
    error: UserMapperError;
};
export interface UserInsertData {
    id: string;
    auth_subject_id: string;
    email: string;
    display_name: string;
    status: string;
    version: number;
    created_at: Date;
    updated_at: Date;
    created_by: string | null;
    updated_by: string | null;
    deleted_at: Date | null;
}
export declare function userDraftToInsertData(draft: import("@livingsites/domain").UserDraft, persistedVersion: number): UserInsertData;
export {};
//# sourceMappingURL=user-mapper.d.ts.map