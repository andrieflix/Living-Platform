/**
 * DrizzleOrganizationCreationPersistence — atomic Organization creation
 * with durable event publication.
 *
 * Inserts the Organization row and the OrganizationCreated outbox record
 * in a single database transaction. Either both commit or neither commits.
 * A duplicate slug produces no outbox record. Each successful creation
 * produces exactly one outbox record.
 *
 * This port replaces the separate create + publish flow for production
 * database-backed execution. The use case calls this port when durable
 * transactional behavior is required.
 */
import { randomUUID } from "node:crypto";
import type { Logger } from "@livingsites/platform";
import type {
  Organization,
  OrganizationDraft,
  OrganizationCreatedEvent,
} from "@livingsites/domain";
import type {
  CreateResult,
  DuplicateKeyError,
  PersistenceUnavailableError,
  InvalidPersistenceStateError,
} from "@livingsites/application";
import type { OrganizationCreationPersistence } from "@livingsites/application";
import type { DrizzleDB } from "../../db/drizzle-instance";
import { organizations, applicationOutbox, type OrganizationRow } from "../../db/schema";
import { rowToOrganization, draftToInsertData } from "../../db/organization-mapper";
import { buildOutboxInsert } from "../../db/outbox-mapper";

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

export interface DrizzleOrganizationCreationPersistenceConfig {
  readonly db: DrizzleDB;
  readonly logger: Logger;
  readonly schemaVersion?: string;
}

export class DrizzleOrganizationCreationPersistence implements OrganizationCreationPersistence {
  private readonly db: DrizzleDB;
  private readonly logger: Logger;
  private readonly schemaVersion: string;

  constructor(config: DrizzleOrganizationCreationPersistenceConfig) {
    this.db = config.db;
    this.logger = config.logger;
    this.schemaVersion = config.schemaVersion ?? "1.0.0";
  }

  async createWithEvent(
    draft: OrganizationDraft,
    event: OrganizationCreatedEvent,
  ): Promise<CreateResult<Organization>> {
    try {
      const result = await this.db.transaction(async (tx: typeof this.db) => {
        const insertData = draftToInsertData(draft, 1);

        const [inserted] = await tx
          .insert(organizations)
          .values({
            id: insertData.id,
            name: insertData.name,
            slug: insertData.slug,
            billing_email: insertData.billing_email,
            plan_id: insertData.plan_id,
            status: insertData.status as "active" | "archived" | "deleted",
            feature_overrides: insertData.feature_overrides,
            version: insertData.version,
            created_at: insertData.created_at,
            updated_at: insertData.updated_at,
            created_by: insertData.created_by,
            updated_by: insertData.updated_by,
            deleted_at: insertData.deleted_at,
          })
          .returning();

        if (!inserted) {
          throw new CreateRepoErrorException({
            code: "invalid_persistence_state",
            message: "Insert returned no row.",
          });
        }

        const mapped = rowToOrganization(inserted as OrganizationRow);
        if (!mapped.ok) {
          throw new CreateRepoErrorException(mapped.error);
        }

        const eventId = randomUUID();
        const idempotencyKey = `organization.created:${String(mapped.value.id)}`;
        const outboxInsert = buildOutboxInsert({
          id: eventId,
          eventType: event.type,
          aggregateType: "organization",
          aggregateId: String(mapped.value.id),
          organizationId: String(event.eventScope.organizationId),
          websiteId: null,
          payload: {
            type: event.type,
            occurredAt: event.occurredAt,
            organizationId: String(event.eventScope.organizationId),
            slug: event.slug,
            planId: event.planId,
          },
          occurredAt: new Date(event.occurredAt),
          idempotencyKey,
          schemaVersion: this.schemaVersion,
        });

        await tx.insert(applicationOutbox).values(outboxInsert);

        return mapped.value;
      });

      return { ok: true, value: result };
    } catch (err) {
      if (err instanceof CreateRepoErrorException) {
        return { ok: false, error: err.error };
      }
      return this.mapCreateError(err, String(draft.slug));
    }
  }

  private mapCreateError(err: unknown, slug: string): { ok: false; error: CreateRepoError } {
    if (isDuplicateKeyError(err)) {
      return {
        ok: false,
        error: {
          code: "duplicate_key",
          message: `An organization with slug "${slug}" already exists.`,
          field: "slug",
          value: slug,
        },
      };
    }
    if (isConnectionError(err)) {
      return {
        ok: false,
        error: { code: "persistence_unavailable", message: "Database connection error during create." },
      };
    }
    this.logger.error("Unexpected createWithEvent error", { error: String(err) });
    return {
      ok: false,
      error: { code: "invalid_persistence_state", message: `Create failed: ${String(err)}` },
    };
  }
}

class CreateRepoErrorException extends Error {
  readonly error: CreateRepoError;
  constructor(error: CreateRepoError) {
    super(error.message);
    this.name = "CreateRepoErrorException";
    this.error = error;
  }
}
