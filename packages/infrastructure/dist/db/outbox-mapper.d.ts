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
export declare function rowToOutboxEventRecord(row: OutboxRow): {
    ok: true;
    value: OutboxEventRecord;
} | {
    ok: false;
    error: OutboxMapperError;
};
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
export declare function buildOutboxInsert(params: OutboxInsertParams): OutboxInsert;
//# sourceMappingURL=outbox-mapper.d.ts.map