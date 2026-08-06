/**
 * Drizzle-backed User repository implementation.
 *
 * Implements UserReader and UserCreator only.
 * Mutation methods (save, softDelete, archive, restore) are not included
 * in this slice — they will be added with their own use cases and tests.
 */
import { eq } from "drizzle-orm";
import type { Logger } from "@livingsites/platform";
import type {
  User,
  UserId,
  AuthSubjectId,
  UserDraft,
} from "@livingsites/domain";
import type {
  CreateResult,
  DuplicateKeyError,
  PersistenceUnavailableError,
  InvalidPersistenceStateError,
} from "@livingsites/application";
import type { UserReader, UserCreator } from "@livingsites/application";
import type { DrizzleDB } from "../../db/drizzle-instance";
import { platformUsers } from "../../db/schema";
import { rowToUser, userDraftToInsertData } from "../../db/user-mapper";

type PlatformUserRow = typeof platformUsers.$inferSelect;

type CreateRepoError = DuplicateKeyError | PersistenceUnavailableError | InvalidPersistenceStateError;

function isDuplicateKeyError(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err) {
    return (err as { code: string }).code === "23505";
  }
  return false;
}

function isConnectionError(err: unknown): boolean {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (e.code === "ECONNREFUSED" || e.code === "ETIMEDOUT" || e.code === "ENOTFOUND") {
      return true;
    }
    if (typeof e.message === "string" && /connection|timeout|unreachable/i.test(e.message)) {
      return true;
    }
  }
  return false;
}

export interface DrizzleUserRepositoryConfig {
  readonly db: DrizzleDB;
  readonly logger: Logger;
}

export class DrizzleUserRepository implements UserReader, UserCreator {
  private readonly db: DrizzleDB;
  private readonly logger: Logger;

  constructor(config: DrizzleUserRepositoryConfig) {
    this.db = config.db;
    this.logger = config.logger;
  }

  async findById(id: UserId): Promise<User | null> {
    try {
      const rows = await this.db.select().from(platformUsers).where(eq(platformUsers.id, String(id)));
      if (rows.length === 0) return null;
      const mapped = rowToUser(rows[0] as PlatformUserRow);
      if (!mapped.ok) {
        this.logger.error("Failed to map platform user row", { id: String(id), error: mapped.error.message });
        return null;
      }
      return mapped.value;
    } catch (err) {
      this.logger.error("findById failed", { id: String(id), error: String(err) });
      return null;
    }
  }

  async findByAuthSubjectId(authSubjectId: AuthSubjectId): Promise<User | null> {
    try {
      const rows = await this.db.select().from(platformUsers).where(eq(platformUsers.auth_subject_id, String(authSubjectId)));
      if (rows.length === 0) return null;
      const mapped = rowToUser(rows[0] as PlatformUserRow);
      if (!mapped.ok) {
        this.logger.error("Failed to map platform user row", { authSubjectId: String(authSubjectId), error: mapped.error.message });
        return null;
      }
      return mapped.value;
    } catch (err) {
      this.logger.error("findByAuthSubjectId failed", { authSubjectId: String(authSubjectId), error: String(err) });
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const normalized = email.trim().toLowerCase();
      const rows = await this.db.select().from(platformUsers).where(eq(platformUsers.email, normalized));
      if (rows.length === 0) return null;
      const mapped = rowToUser(rows[0] as PlatformUserRow);
      if (!mapped.ok) {
        this.logger.error("Failed to map platform user row", { email: normalized, error: mapped.error.message });
        return null;
      }
      return mapped.value;
    } catch (err) {
      this.logger.error("findByEmail failed", { email, error: String(err) });
      return null;
    }
  }

  async create(draft: UserDraft): Promise<CreateResult<User>> {
    try {
      const insertData = userDraftToInsertData(draft, 1);

      const [inserted] = await this.db.insert(platformUsers).values({
        id: insertData.id,
        auth_subject_id: insertData.auth_subject_id,
        email: insertData.email,
        display_name: insertData.display_name,
        status: insertData.status as "active" | "archived" | "deleted",
        version: insertData.version,
        created_at: insertData.created_at,
        updated_at: insertData.updated_at,
        created_by: insertData.created_by,
        updated_by: insertData.updated_by,
        deleted_at: insertData.deleted_at,
      }).returning();

      if (!inserted) {
        return {
          ok: false,
          error: { code: "invalid_persistence_state", message: "Insert returned no row." },
        };
      }

      const mapped = rowToUser(inserted as PlatformUserRow);
      if (!mapped.ok) {
        return { ok: false, error: mapped.error };
      }

      return { ok: true, value: mapped.value };
    } catch (err) {
      return this.mapCreateError(err, String(draft.email));
    }
  }

  private mapCreateError(err: unknown, email: string): { ok: false; error: CreateRepoError } {
    if (isDuplicateKeyError(err)) {
      return {
        ok: false,
        error: {
          code: "duplicate_key",
          message: `A user with email "${email}" already exists.`,
          field: "email",
          value: email,
        },
      };
    }
    if (isConnectionError(err)) {
      return {
        ok: false,
        error: { code: "persistence_unavailable", message: "Database connection error during create." },
      };
    }
    this.logger.error("Unexpected user create error", { error: String(err) });
    return {
      ok: false,
      error: { code: "invalid_persistence_state", message: `Create failed: ${String(err)}` },
    };
  }
}
