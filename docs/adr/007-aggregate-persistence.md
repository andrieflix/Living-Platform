# ADR 007 — Aggregate and Persistence Architecture

> **Status:** Accepted

## Context

The Living Sites platform has approved five architectural layers (Domain,
Application, Composition, Platform, Infrastructure) and two cross-cutting
concerns (Use Cases, Business Policies). The domain layer defines entities
and value objects across 13 bounded contexts. The application layer defines
repository contracts that the infrastructure layer will implement.

What is missing is the **aggregate model** — the answer to "which entities
form a consistency unit, and how are they persisted together?" Without
aggregates, each repository would persist one table row, and cross-entity
invariants (e.g. "a page's sectionOrder must match its sections") would be
enforced by database constraints or use case code, with no clear ownership.

Consider a `Page` with 12 `Section` children. Without an aggregate model:

- A `SectionRepository.save()` could persist a section without updating the
  page's `sectionOrder`. The invariant is broken. (This is why child
  entities must never have public repository ports.)
- Two use cases could mutate different sections of the same page in parallel
  transactions. One overwrites the other's `sortOrder` change.
- The `PageRepository` would need to know about sections to load a page for
  rendering, but the repository contract only mentions `Page`, not
  `Section`. The boundary is unclear.
- A "publish page" operation would need to atomically snapshot the page and
  all its sections, but there is no defined transaction boundary.

Forces:

- **Business consistency must be preserved.** A page and its sections are a
  single unit — reordering, adding, or removing sections must be atomic with
  the page mutation.
- **Transaction boundaries must be explicit.** Without aggregates, every use
  case invents its own transaction scope, leading to inconsistency.
- **Repositories need clear ownership.** A repository must own a defined set
  of data — not "the pages table" but "the Page aggregate."
- **Cross-aggregate references must be safe.** A page references a website by
  ID, not by object reference. Without this rule, use cases would
  accidentally load full object graphs, creating hidden coupling and
  performance problems.
- **The domain model must scale.** As the platform grows to 78 policies and
  19 aggregate roots, the consistency model must be principled, not ad hoc.
- **Persistence must follow the model, not lead it.** If persistence (table
  structure) drives the aggregate design, business rules fragment across
  table boundaries. The aggregate model must come from the domain, and
  persistence must adapt.

## Decision

Adopt **Domain-Driven Design aggregates** as the consistency model for the
Living Sites platform. Define 21 aggregate roots across 14 bounded contexts.
Each aggregate has:

1. **An Aggregate Root** — the only entry point for mutations.
2. **Child entities** (where applicable) — loaded, mutated, and persisted
   through the root.
3. **Value objects** — immutable, no identity, part of the root.
4. **Invariants** — business rules that must always hold within the
   aggregate, enforced by the root.
5. **A Repository Owner** — the repository that persists the aggregate.
6. **A Transaction Boundary** — one database transaction per aggregate save.

Rules:

1. **Repositories own Aggregate Roots only.** A repository persists an
   aggregate root and its children. No standalone repository for child
   entities.
2. **Children never have public repository ports.** `Section` is a child
   of `Page`; there is no `SectionRepository` that loads a section
   independently. `FormField` is a child of `Form`; no
   `FormFieldRepository`. `MenuItem` is a child of `Navigation`; no
   `MenuItemRepository`. `WebsiteSettings` is a child of `Website`; no
   `WebsiteSettingsRepository`. Children are loaded, mutated, and persisted
   through their aggregate root's repository.
3. **Transactions never cross Aggregate boundaries.** One transaction per
   aggregate. Cross-aggregate coordination uses domain events.
4. **Read models are immutable.** Read models are projections — they are
   never mutated by use cases, only refreshed by projection handlers.
5. **Aggregates enforce invariants.** The root validates internal
   consistency before accepting a mutation.
6. **Snapshots are append-only.** Published page snapshots are immutable
   records, never modified after creation.
7. **References between aggregates are by ID only.** No direct object
   references across aggregate boundaries.
8. **Aggregates are loaded eagerly.** No lazy loading within an aggregate.
9. **Persistence follows aggregate boundaries.** A repository `save` persists
   the entire aggregate in one transaction.
10. **Optimistic concurrency on all mutable aggregates.** Every mutable
    aggregate root carries a required `version: AggregateVersion` field (a
    monotonically increasing number defined in `@livingsites/domain`). A
    repository `save` requires `expectedVersion` as a second parameter and
    returns a typed `ConcurrencyConflict` when the stored version differs.
    A successful save increments the version exactly once. No pessimistic
    locks. Immutable aggregates (PageSnapshot) do not carry a version —
    they use `revisionNumber` for immutable publication history. The
    initial-version convention is: version 0 before first persistence,
    version 1 after the first successful create (`INITIAL_AGGREGATE_VERSION
    = 0`). Repository creation and mutation are separate operations:
    `create` takes a candidate (no id, no version) and returns version 1;
    `save` takes an aggregate with id and `expectedVersion`. Creation
    conflicts return typed Application errors (DuplicateKeyError,
    PersistenceUnavailableError), not ConcurrencyConflict. Child entities
    (Section, FormField, MenuItem, WebsiteSettings) do not carry an
    independent version — they share the root's concurrency boundary. A
    change to any child increments the root's version exactly once.
    Concurrency conflicts are returned as typed `SaveResult<T>` results and
    are never swallowed. Automatic retries are allowed only for explicitly
    safe, idempotent operations.
11. **The final-owner invariant is transactionally enforced.** An
    Organization must always retain at least one active owner.
    Owner-changing operations execute through a dedicated transaction
    boundary with strong consistency using an implementation-appropriate
    concurrency mechanism. Platform-admin recovery is emergency remediation
    only.
12. **Aggregate definitions belong to the Domain layer.** Aggregate roots,
    child entities, invariants, and consistency boundaries live in
    `packages/domain/src/aggregates/`. The Application layer defines
    repository contracts and use cases — not aggregate boundaries.
13. **No generic AggregateRoot framework or superclass.** Aggregates are
    plain domain entities with documented boundaries. A base class or
    framework requires a separate approved ADR.

The full aggregate catalog is in `docs/aggregates.md`. The persistence model
(snapshots, versioning, read models, projections, caching, lazy loading,
optimistic concurrency, soft deletes, archival) is in
`docs/persistence-model.md`.

## Consequences

- **Positive:** Business consistency is preserved by construction — a page
  and its sections are always saved atomically. Transaction boundaries are
  explicit and uniform — every use case saves one aggregate in one
  transaction. Cross-aggregate references are safe — an aggregate holds IDs,
  not object references, preventing hidden coupling. The domain model leads
  persistence — the database schema is an implementation detail, not an
  architectural driver. Snapshots provide an immutable published-content
  history, enabling version comparison and future rollback. Read models
  decouple query performance from aggregate complexity — the UI loads flat
  projections, not full object graphs. Optimistic concurrency scales better
  than pessimistic locking — no long-held locks, no deadlocks between
  concurrent editors.

- **Negative:** More complexity than a flat table-per-entity model. The
  distinction between aggregate root and child entity requires discipline —
  a developer must not add a repository for a child. Cross-aggregate
  operations require eventual consistency — a use case that needs two
  aggregates to be consistent immediately must use a saga or accept a brief
  inconsistency window. Eager loading of large aggregates (a page with 50
  sections) loads more data than a lazy approach — but the alternative
  (lazy loading) breaks invariant checking. Read models add a projection
  layer — there is a brief window between aggregate mutation and read model
  update.

- **Neutral:** The aggregate model is a conceptual framework, not a runtime
  framework. There is no "aggregate base class" — aggregates are plain
  domain entities with documented boundaries. The application layer
  enforces the rules via repository contracts and use case patterns.
  Introducing a generic AggregateRoot framework or superclass requires a
  separate approved ADR.

## Alternatives Considered

- **Table-per-entity with foreign keys.** Each entity has its own table and
  its own repository. Cross-entity invariants are enforced by database
  constraints (foreign keys, unique indexes) and use case code. Rejected
  because it has no transaction boundary — a page update and a section
  update are separate transactions, and the `sectionOrder` invariant can be
  broken between them. Also, the database schema drives the model rather
  than the model driving the schema.

- **Single mega-aggregate per website.** The entire website (pages,
  sections, media, forms, navigation, SEO) is one aggregate. The
  `WebsiteRepository` loads and saves everything. Rejected because it
  creates a massive transaction boundary — any mutation locks the entire
  website. It also violates the DDD principle that aggregates should be as
  small as possible while preserving consistency. A page reorder and a
  media upload would be in the same transaction, which is neither necessary
  nor performant.

- **No aggregates, use case-driven transactions.** Each use case defines its
  own transaction scope — `PublishPage` saves the page and sections in one
  transaction, `ReorderSections` saves sections in another. Rejected because
  it has no consistent model — every use case invents its own boundary,
  leading to inconsistency. There is no answer to "what does the
  PageRepository own?" — it might save just the page in one use case and the
  page + sections in another. Invariants have no home.

- **Event sourcing.** Store all mutations as an append-only event log;
  reconstruct aggregate state by replaying events. Rejected as premature —
  the platform's write patterns are CRUD-like (edit a page, upload media,
  submit a form) and do not benefit from event replay complexity. Event
  sourcing adds an event store, projections for every read, and snapshot
  complexity. The platform uses domain events for cross-aggregate
  coordination without full event sourcing.

- **CQRS with separate read and write models from day one.** Every read goes
  through a pre-computed projection; every write goes through an aggregate.
  Rejected as premature — most read models can be computed on-demand (query-
  time projection) with adequate performance. Full CQRS adds a projection
  infrastructure for every read model. The architecture supports CQRS (read
  models and projections are defined) but does not mandate pre-computed
  projections for all reads. Expensive aggregations (analytics) use
  pre-computed projections; simple lists use on-demand projections.

## Why aggregates exist

Aggregates exist because business consistency has boundaries. A page and its
sections are a consistency unit — reordering sections must be atomic with the
page's `sectionOrder` update. An organization and its feature overrides are
a consistency unit — adding an override must not create duplicates. Without
aggregates, these boundaries are implicit, enforced by convention or database
constraints, and they drift. Aggregates make the boundaries explicit, named,
and testable.

## Why repositories own aggregates

A repository is the persistence gateway for an aggregate. If a repository
owned only a table (e.g. `PageRepository` owns the `pages` table), it would
not own the sections — and the page's invariants (which depend on sections)
could not be enforced at save time. By owning the aggregate (Page + Sections),
the repository ensures that every save is atomic and every invariant is
checked within the transaction. The repository is the aggregate's
perspective on the database.

## Why persistence follows aggregates instead of tables

If persistence followed table boundaries, the application layer would need to
know about tables — "to save a page, update the pages table, then upsert the
sections table, then delete removed sections." This leaks database structure
into the application, making the use case code dependent on schema decisions.
If the schema changes (e.g. sections are stored as JSON on the page row
instead of a separate table), every use case that touches sections must
change. By making persistence follow aggregates, the repository hides the
schema — the use case says `pageRepository.save(page)` and the repository
decides how to persist it. The schema can change without affecting the
application layer.

## Future scalability

The aggregate model scales in several ways:

1. **Read-side scaling.** Read models can be pre-computed and stored
   separately from the write model. As traffic grows, reads can be served
   from a cache or a separate read store without affecting the write path.

2. **Partitioning by aggregate.** Each aggregate is independently queryable
   by ID. Aggregates can be partitioned by org or website ID without
   cross-partition transactions (since transactions never cross aggregate
   boundaries).

3. **Event-driven projections.** As the platform grows, on-demand
   projections can be replaced with event-driven materialized projections
   without changing the write model. The aggregate model is unchanged — only
   the read side evolves.

4. **Saga patterns for cross-aggregate workflows.** Complex operations that
   span multiple aggregates (e.g. "archive a website and all its pages,
   media, and forms") can be implemented as sagas — a sequence of aggregate
   mutations coordinated by domain events. The aggregate boundaries define
   the saga steps.

5. **Multi-region replication.** Because transactions are scoped to a single
   aggregate, the platform can replicate aggregates independently. A page
   mutation in one region does not block a media mutation in another. The
   aggregate boundary is the replication boundary.

6. **Plugin-contributed aggregates.** A future plugin could contribute a new
   aggregate (e.g. a "CommerceProduct" aggregate). The aggregate model
   defines where it fits — the plugin defines the root, invariants, and
   repository contract, and the composition root wires it.
