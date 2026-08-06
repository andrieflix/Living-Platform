/**
 * Application-layer ports for durable, transactional event persistence.
 *
 * The CreateOrganization use case must persist the Organization aggregate
 * and the OrganizationCreated outbox record atomically — either both
 * commit or neither commits. The Domain and Application layers must not
 * depend on Drizzle transactions or any specific persistence provider.
 *
 * These ports define the smallest provider-independent contract needed
 * for that atomic persistence. Infrastructure provides the concrete
 * implementation; the composition root wires it.
 */
import type { Organization, OrganizationDraft, OrganizationCreatedEvent, OrganizationId } from "@livingsites/domain";
import type { CreateResult } from "../contracts";
/**
 * Atomic persistence port for Organization creation.
 *
 * Persists the Organization aggregate and the OrganizationCreated event
 * outbox record in a single database transaction. Either both succeed
 * or neither does. Returns the created Organization at version 1, or a
 * typed creation error.
 *
 * This port replaces the separate create + publish flow for production
 * database-backed execution. The use case calls this port instead of
 * OrganizationCreator.create + EventPublisher.publish when durable
 * transactional behavior is required.
 */
export interface OrganizationCreationPersistence {
    createWithEvent(draft: OrganizationDraft, event: OrganizationCreatedEvent): Promise<CreateResult<Organization>>;
}
/**
 * Result of an outbox event claim attempt.
 */
export interface OutboxClaimResult {
    readonly claimed: readonly OutboxEventRecord[];
}
/**
 * A pending outbox event as seen by the processor.
 */
export interface OutboxEventRecord {
    readonly id: string;
    readonly eventType: string;
    readonly aggregateType: string;
    readonly aggregateId: string;
    readonly organizationId: string | null;
    readonly websiteId: string | null;
    readonly payload: Readonly<Record<string, unknown>>;
    readonly occurredAt: string;
    readonly schemaVersion: string;
    readonly attemptCount: number;
}
/**
 * Outcome of dispatching an outbox event to registered handlers.
 */
export type DispatchOutcome = {
    ok: true;
} | {
    ok: false;
    error: string;
};
/**
 * Provider-independent contract for processing pending outbox events.
 * Infrastructure provides the database-backed implementation.
 */
export interface OutboxProcessor {
    /**
     * Claims a batch of pending events, dispatches them to registered
     * handlers, and updates their status. Returns the number of events
     * processed (successfully or failed).
     */
    processBatch(batchSize?: number): Promise<number>;
    /**
     * Registers an in-process handler for a specific event type.
     * Multiple handlers per event type are supported.
     */
    registerHandler(eventType: string, handler: (event: OutboxEventRecord) => Promise<DispatchOutcome>): void;
}
/**
 * Port for checking whether an outbox event with the given idempotency
 * key already exists. Used to prevent duplicate event publication from
 * retried requests.
 */
export interface OutboxIdempotencyChecker {
    existsByIdempotencyKey(key: string): Promise<boolean>;
}
/**
 * Port for reading outbox events by aggregate ID. Used in tests and
 * by the outbox processor for verification.
 */
export interface OutboxReader {
    findByAggregate(aggregateType: string, aggregateId: string): Promise<readonly OutboxEventRecord[]>;
    findById(id: string): Promise<OutboxEventRecord | null>;
}
export type { OrganizationId };
//# sourceMappingURL=outbox.d.ts.map