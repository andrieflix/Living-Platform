# ADR 005 — Use Case Architecture

> **Status:** Accepted

## Context

The Living Sites platform has approved domain, application, composition, and
platform layers. The application layer currently defines repository contracts
and service contracts — the *what* of data access and service operations. But
it does not yet define the *how* of business orchestration: the ordered steps
that turn a user intent into a state change, an event, and a response.

A CRUD architecture — where the UI calls repository methods directly through
thin service wrappers — would be simpler to build but would scatter business
rules across the codebase. Authorization checks would live in UI components.
Validation would happen in API routes. Event emission would be an afterthought.
Multi-step operations (publish, export, upload) would have no home. Background
jobs would duplicate logic from the request path. The result: business rules
that are impossible to audit, test, or reuse.

Forces:

- Every mutation must be auditable — there must be one place to look for "what
  happens when a page is published."
- Business orchestration must be reusable — a background job that publishes a
  scheduled page must run the same logic as a user clicking "Publish."
- Authorization must be enforced inside the business operation, not in the UI.
- Events must be emitted reliably — only after the operation succeeds, never
  on failure.
- The architecture must scale to 80+ commands, 50+ queries, and 23 background
  jobs across 12 contexts without becoming unmaintainable.

## Decision

Adopt a **use case architecture**: every business operation is expressed as a
named use case that contains its complete orchestration — authorization,
validation, repository reads, domain checks, repository writes, and event
emission. Use cases are organized by bounded context in
`packages/application/src/use-cases/`.

Rules:

1. **Use cases contain business orchestration.** The use case is the single
   place where a business operation's steps are ordered and combined.
2. **Repositories never contain business rules.** Repositories are data access
   contracts only.
3. **Services never bypass use cases.** Service implementations call use case
   methods.
4. **Every mutation originates from a use case.** No code outside a use case
   writes to a repository.
5. **Queries never mutate state.** Query use cases read and return read
   models.
6. **Commands never return read models.** Commands return entities or
   `DomainError`.
7. **Background jobs execute use cases.** Jobs are triggers, not logic.
8. **Events are emitted only by completed use cases.** Failed use cases emit
   nothing.

The master catalog (`docs/use-cases.md`) lists every use case across all 12
bounded contexts with commands, queries, long-running operations, background
jobs, events produced, events consumed, external dependencies, authorization
requirements, and future extension points.

## Consequences

- **Positive:** Business operations are auditable — each use case is a
  self-contained, named unit that can be read, tested, and reviewed in
  isolation. Background jobs reuse the exact same use case logic as the
  request path — no duplication. Authorization is enforced inside the use
  case, never bypassed by a UI shortcut. Events are emitted reliably after
  success. The catalog makes it impossible to "forget" a business operation —
  if it's not in the catalog, it doesn't exist. Cross-context coupling is
  mediated by events, not by direct calls, keeping contexts independent.
- **Negative:** More indirection than CRUD — a mutation goes through a use
  case rather than a direct repository call. The use case catalog is large
  (80 commands, 53 queries) and must be maintained. Developers must resist
  the temptation to add "quick" repository writes outside use cases. The
  command/query separation means the UI sometimes needs two calls (command +
  query) where CRUD would do one.
- **Neutral:** Use cases are not a framework or runtime construct — they are
  an organizational and architectural convention. They will be implemented as
  methods on service interfaces (or standalone use case interfaces) in a
  future milestone. The current milestone defines the catalog and rules only.

## Alternatives Considered

- **CRUD (thin services over repositories).** Service methods map 1:1 to
  repository methods (`createPage`, `updatePage`, `deletePage`). Rejected
  because business orchestration (publish = validate + snapshot + status
  update + event) has no home — it scatters across UI components, API routes,
  or ad-hoc service methods. Authorization and event emission become
  inconsistent. Background jobs duplicate request-path logic.

- **Active Record pattern.** Entities have `save()`, `delete()`, and query
  methods directly on them. Rejected because it couples the domain to
  persistence, violates the domain layer's purity (ADR 001), and scatters
  business rules across entity methods with no orchestration seam.

- **CQRS with separate command and query buses.** Formal command/query
  separation with dedicated buses, handlers, and projections. Rejected as
  premature — the use case architecture already separates commands from
  queries (commands mutate, queries read), but without the infrastructure
  overhead of separate buses and read-model projections. CQRS can be adopted
  later for specific contexts (e.g. analytics) if read scaling demands it.

- **Event sourcing.** Store every state change as an event and derive state
  by replaying. Rejected as premature — the platform emits domain events as
  facts (ADR context: domain events), but does not use them as the primary
  persistence model. Event sourcing can be adopted for specific contexts
  (e.g. audit trail) if the need arises, without changing the use case
  architecture.

- **Domain-driven design aggregates with method-based operations.** Entities
  expose business methods (`page.publish()`, `page.archive()`) that encapsulate
  state transitions. Partially adopted — the domain defines enums and types
  for state transitions — but the *orchestration* (authorization, repository
  writes, event emission) lives in use cases, not on entities. This avoids
  coupling the domain to repositories and events while keeping state
  transition logic in the domain where possible.
