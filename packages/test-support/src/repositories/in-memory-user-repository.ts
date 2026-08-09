/**
 * In-memory User repository for tests.
 *
 * Implements UserReader and UserCreator using an in-memory Map.
 * Create behavior matches production:
 * - accepts UserDraft (version 0)
 * - returns User at version 1
 * - enforces unique authSubjectId
 * - enforces unique email
 * - typed errors (DuplicateKeyError)
 */
import type {
  User,
  UserId,
  AuthSubjectId,
  UserDraft,
  AggregateVersion,
} from "@livingsites/domain";
import type {
  CreateResult,
  UserReader,
  UserCreator,
} from "@livingsites/application";

interface StoredUser {
  id: UserId;
  authSubjectId: AuthSubjectId;
  email: string;
  displayName: string;
  status: string;
  version: AggregateVersion;
  audit: { createdAt: string; updatedAt: string; createdBy?: string; updatedBy?: string };
}

export class InMemoryUserRepository implements UserReader, UserCreator {
  private store: Map<string, StoredUser> = new Map();
  private authSubjectIndex: Map<string, string> = new Map();
  private emailIndex: Map<string, string> = new Map();

  async findById(id: UserId): Promise<User | null> {
    const row = this.store.get(String(id));
    return row ? this.toDomain(row) : null;
  }

  async findByAuthSubjectId(authSubjectId: AuthSubjectId): Promise<User | null> {
    const id = this.authSubjectIndex.get(String(authSubjectId));
    if (!id) return null;
    const row = this.store.get(id);
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const id = this.emailIndex.get(normalized);
    if (!id) return null;
    const row = this.store.get(id);
    return row ? this.toDomain(row) : null;
  }

  async create(draft: UserDraft): Promise<CreateResult<User>> {
    const authSubjectId = String(draft.authSubjectId);
    if (this.authSubjectIndex.has(authSubjectId)) {
      return {
        ok: false,
        error: {
          code: "duplicate_key",
          message: `A user with authSubjectId "${authSubjectId}" already exists.`,
          field: "auth_subject_id",
          value: authSubjectId,
        },
      };
    }

    const normalizedEmail = draft.email.trim().toLowerCase();
    if (this.emailIndex.has(normalizedEmail)) {
      return {
        ok: false,
        error: {
          code: "duplicate_key",
          message: `A user with email "${normalizedEmail}" already exists.`,
          field: "email",
          value: normalizedEmail,
        },
      };
    }

    const row: StoredUser = {
      id: draft.id,
      authSubjectId: draft.authSubjectId,
      email: normalizedEmail,
      displayName: draft.displayName,
      status: draft.status,
      version: 1,
      audit: { createdAt: draft.audit.createdAt, updatedAt: draft.audit.updatedAt },
    };

    this.store.set(String(draft.id), row);
    this.authSubjectIndex.set(authSubjectId, String(draft.id));
    this.emailIndex.set(normalizedEmail, String(draft.id));

    return { ok: true, value: this.toDomain(row)! };
  }

  private toDomain(row: StoredUser): User {
    return {
      id: row.id,
      authSubjectId: row.authSubjectId,
      email: row.email,
      displayName: row.displayName,
      status: row.status as "active" | "archived" | "deleted",
      version: row.version,
      audit: row.audit as import("@livingsites/domain").AuditTrail,
    };
  }

  clear(): void {
    this.store.clear();
    this.authSubjectIndex.clear();
    this.emailIndex.clear();
  }
}
