# ADR 008: Transactional Outbox for Atomic Aggregate Persistence

## Status

Accepted

## Context

The Create Organization vertical slice must persist an Organization aggregate
and publish an `OrganizationCreated` domain event. The approved architecture
(Architecture Version 1.0) states that transactions never cross aggregate
boundaries (rule 104). However, the Organization and its outbox event record
are not two independent aggregates — the outbox record is an infrastructure
artifact of the persistence operation, not a domain aggregate.

The production requirement is:
- Organization insertion and `OrganizationCreated` outbox insertion occur
  in the same database transaction.
- Either both commit or neither commits.
- A duplicate or failed organization create produces no outbox record.
- Each successful creation produces exactly one outbox record.
- Retrying the same idempotent request must not produce duplicate events.

The previous implementation persisted the aggregate and then published the
event in a separate step. If the process crashed between the two steps, the
event would be lost. If the publish succeeded but the transaction rolled back,
a phantom event would exist with no corresponding aggregate.

## Decision

Implement a **transactional outbox** pattern:

1. **New Application port**: `OrganizationCreationPersistence` — a focused
   port that atomically persists the Organization aggregate and writes the
   `OrganizationCreated` outbox record in a single database transaction.
   The Domain and Application layers do not depend on Drizzle transactions.
   Infrastructure provides the transaction-backed implementation.

2. **New `application_outbox` table**: stores pending events with an
   idempotency key, status, attempt count, and backoff scheduling.

3. **`OutboxEventPublisher`**: implements the existing `EventPublisher` port
   by writing to the outbox table. When called within a transaction context
   (via `OrganizationCreationPersistence`), the insert participates in that
   transaction.

4. **`DrizzleOrganizationCreationPersistence`**: uses `db.transaction()` to
   insert both the Organization row and the outbox row atomically.

5. **`DrizzleOutboxProcessor`**: a separate worker that claims pending
   events, dispatches them to registered in-process handlers, and marks them
   processed or failed with bounded retry.

6. **The CreateOrganization use case** uses `OrganizationCreationPersistence`
   when available (production), and falls back to the separate create +
   publish flow when it is absent (test/development with in-memory adapters).

## Consequences

- The Application layer gains one new focused port
  (`OrganizationCreationPersistence`). This is the smallest
  provider-independent contract needed; it is not a general-purpose
  transaction framework.
- The Domain layer is unchanged — it does not know about transactions or
  the outbox.
- The outbox processor is a separate operational concern, invoked by an
  explicit worker command, not automatically at startup.
- Eventual consistency: events are delivered asynchronously by the
  processor, not synchronously by the use case.
- The outbox table grows over time; a future retention/cleanup policy
  is needed but is out of scope for this sprint.
