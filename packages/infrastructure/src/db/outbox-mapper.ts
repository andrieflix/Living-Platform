/**
 * Persistence mapper between database outbox rows and application
 * OutboxEventRecord contracts.
 *
 * Private to Infrastructure. Never leaked outside. Validates payload
 * shape and rejects malformed state.
 */
import type { OutboxRow, OutboxInsert } from "./schema";
import type { InvalidPersistenceStateError } from "@livingsites/application";
import type { OutboxEventRecord } from "@livingsites/application";

export type OutboxMapperError = InvalidPersistenceStateError;

export function rowToOutboxEventRecord(
  row: OutboxRow,
): { ok: true; value: OutboxEventRecord } | { ok: false; error: OutboxMapperError } {
  if (!row.id) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox row missing id." } };
  }
  if (!row.event_type) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox row missing event_type." } };
  }
  if (!row.aggregate_type) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox row missing aggregate_type." } };
  }
  if (!row.aggregate_id) {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox row missing aggregate_id." } };
  }

  let payload: Readonly<Record<string, unknown>>;
  if (typeof row.payload === "string") {
    try {
      const parsed = JSON.parse(row.payload) as unknown;
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox payload is not a JSON object." } };
      }
      payload = parsed as Record<string, unknown>;
    } catch {
      return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox payload has invalid JSON." } };
    }
  } else if (typeof row.payload === "object" && row.payload !== null && !Array.isArray(row.payload)) {
    payload = row.payload as Record<string, unknown>;
  } else {
    return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox payload has unexpected type." } };
  }

  const record: OutboxEventRecord = {
    id: row.id,
    eventType: row.event_type,
    aggregateType: row.aggregate_type,
    aggregateId: row.aggregate_id,
    organizationId: row.organization_id,
    websiteId: row.website_id,
    payload,
    occurredAt: row.occurred_at instanceof Date ? row.occurred_at.toISOString() : String(row.occurred_at),
    schemaVersion: row.schema_version,
    attemptCount: row.attempt_count,
  };

  return { ok: true, value: record };
}

export interface OutboxInsertParams {
  readonly id: string;
  readonly eventType: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly organizationId: string | null;
  readonly websiteId: string | null;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly occurredAt: Date;
  readonly idempotencyKey: string;
  readonly schemaVersion: string;
}

export function buildOutboxInsert(params: OutboxInsertParams): OutboxInsert {
  return {
    id: params.id,
    event_type: params.eventType,
    aggregate_type: params.aggregateType,
    aggregate_id: params.aggregateId,
    organization_id: params.organizationId,
    website_id: params.websiteId,
    payload: params.payload,
    occurred_at: params.occurredAt,
    status: "pending",
    attempt_count: 0,
    available_at: new Date(),
    processed_at: null,
    last_error: null,
    idempotency_key: params.idempotencyKey,
    schema_version: params.schemaVersion,
  };
}
