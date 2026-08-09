/**
 * Persistence mapper between database platform_users rows and Domain User aggregates.
 *
 * Private to Infrastructure. Never leaked outside. Reconstructs branded IDs,
 * validates required persisted fields, and rejects impossible database state
 * with InvalidPersistenceStateError.
 */
import type {
  User,
  UserId,
  AuthSubjectId,
  ISODateString,
  AuditTrail,
  AggregateVersion,
} from "@livingsites/domain";
import type { platformUsers } from "./schema";
import type { InvalidPersistenceStateError } from "@livingsites/application";

type PlatformUserRow = typeof platformUsers.$inferSelect;

export type UserMapperError = InvalidPersistenceStateError;

function asUserId(id: string): UserId {
  return id as UserId;
}

function asAuthSubjectId(id: string): AuthSubjectId {
  return id as AuthSubjectId;
}

function asISODateString(ts: string | Date): ISODateString {
  return (ts instanceof Date ? ts.toISOString() : ts) as ISODateString;
}

export function rowToUser(
  row: PlatformUserRow,
): { ok: true; value: User } | { ok: false; error: UserMapperError } {
  if (!row.id) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Platform user row missing id." } };
  }
  if (!row.auth_subject_id) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Platform user row missing auth_subject_id." } };
  }
  if (!row.email) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Platform user row missing email." } };
  }
  if (row.version < 1) {
    return { ok: false, error: { code: "invalid_persistence_state", message: `Platform user row has invalid version: ${row.version}.` } };
  }

  const audit: AuditTrail = {
    createdAt: asISODateString(row.created_at),
    updatedAt: asISODateString(row.updated_at),
    ...(row.created_by !== null ? { createdBy: row.created_by as UserId } : {}),
    ...(row.updated_by !== null ? { updatedBy: row.updated_by as UserId } : {}),
  };

  const user: User = {
    id: asUserId(row.id),
    authSubjectId: asAuthSubjectId(row.auth_subject_id),
    email: row.email,
    displayName: row.display_name,
    status: row.status as "active" | "archived" | "deleted",
    version: row.version as AggregateVersion,
    audit,
  };

  return { ok: true, value: user };
}

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

export function userDraftToInsertData(
  draft: import("@livingsites/domain").UserDraft,
  persistedVersion: number,
): UserInsertData {
  return {
    id: String(draft.id),
    auth_subject_id: String(draft.authSubjectId),
    email: draft.email,
    display_name: draft.displayName,
    status: draft.status,
    version: persistedVersion,
    created_at: new Date(draft.audit.createdAt),
    updated_at: new Date(draft.audit.updatedAt),
    created_by: draft.audit.createdBy !== undefined ? String(draft.audit.createdBy) : null,
    updated_by: draft.audit.updatedBy !== undefined ? String(draft.audit.updatedBy) : null,
    deleted_at: null,
  };
}
