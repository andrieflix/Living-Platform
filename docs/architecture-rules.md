# Living Sites — Architecture Rules

> **Permanent rules.** Every contribution to Living Sites must obey these. They
> are not suggestions. Violations should be caught in review and, where
> possible, enforced by tooling (lint rules, type constraints, CI checks).

## 1. Tenancy

1. **Every business entity belongs to a Website or an Organization.** No
   free-floating content. If an entity has no `websiteId` or `organizationId`,
   it is a platform-global resource (Plan, Feature, SectionType, system Theme,
   Plugin) — and that must be explicit in its type.
2. **Every Website belongs to exactly one Organization.** Modeled on the
   entity (`Website.organizationId`), never inferred.
3. **Never hardcode client-specific values.** Tajon Construction is the first
   customer, not a special case. No org name, domain, color, or content lives
   in code. Everything is data.
4. **Tenant isolation is enforced at the data layer (RLS) and the service
   layer**, never only at the UI. A missing tenant check in a query is a
   security defect.

## 2. Package structure and dependency direction

5. **The domain package (`@livingsites/domain`) contains only entities, value
   objects, enums, and types.** No service contracts. No repository contracts.
   No I/O. No framework imports. No dependencies on any other package.
6. **The application package (`@livingsites/application`) contains repository
   contracts and service contracts.** Interfaces only — no implementation. It
   depends on `@livingsites/domain` for entity types.
7. **Dependency direction is strictly one-way:**
   `UI/API → application → domain`. No import in `@livingsites/domain` may
   reference `@livingsites/application` or any external package. No import in
   UI may reference `@livingsites/domain` repositories.
8. **Business logic belongs in services.** Services orchestrate repositories,
   enforce invariants, and make authorization decisions. Repositories are
   dumb pipes.
9. **Data access belongs in repositories.** Only repository implementations
   issue queries. Services never write SQL or touch a storage SDK directly.
10. **UI must never directly access repositories.** The UI (and API routes)
    depend on service contracts only. This is enforced by import boundaries:
    presentation code may not import from
    `@livingsites/application/repositories`.
11. **Future database providers must be replaceable.** Repository interfaces
    (in `@livingsites/application`) are the seam. Swapping Supabase for another
    provider must not require changes to services or UI.

## 3. Module boundaries

12. **Each bounded context owns its entities in `@livingsites/domain` and its
    repository/service contracts in `@livingsites/application`.** No context
    reaches into another context's private types — only through the public
    barrel (`index.ts`) or service interfaces.
13. **The `website` context is split into `website`, `navigation`, and
    `theme`.** Each has its own entities and contracts. The `website` context
    re-exports navigation and theme entities for compatibility, but the
    contracts are separate.
14. **Reserved contexts (`builder`, `rendering`, `plugin`, `events`) define
    contracts and documentation only.** No implementation until their
    milestone. Each has a `README.md` describing future responsibilities.
15. **Cross-context orchestration services (`BuilderService`,
    `RenderingService`) live in `@livingsites/application/services/cross-context.ts`,
    not in a single bounded context.** They may depend on multiple contexts'
    service interfaces but never on repositories directly.

## 4. Sections and rendering

16. **Sections are registered components only.** A Section must reference a
    SectionType in the registry. Free-form HTML sections are not permitted in
    the core model; if needed, they ship as a registered `raw_html`
    SectionType with its own validation and sanitization.
17. **SectionType defines the props schema; Section holds the values.** The
    builder validates section props against the schema before persisting.
18. **Rendering is a service contract (`RenderingService`), not a UI concern.**
    The public site, preview, and export pipeline all go through it. The
    rendering vocabulary (`RenderedPage`, `RenderContext`, `OutputFormat`)
    lives in the domain `rendering` context.
19. **Published content is immutable (`PageSnapshot`).** The public site
    renders from snapshots, not live draft state. This guarantees stability
    and enables rollback.

## 5. Versioning strategy

20. **Draft state is mutable; published state is immutable.** The live entity
    holds draft work; `PageSnapshot` is frozen at publish time.
21. **Every publish creates a new snapshot; old snapshots are archived, not
    deleted.** This is the basis for rollback and audit.
22. **Rollback creates a new snapshot from an old one; it never mutates or
    deletes intermediate versions.** See domain-model.md §5.
23. **Scheduled publishing is a first-class state (`PageStatus.Scheduled`).**
    One scheduled publish per page at a time; canceling returns to draft.
24. **Audit trails are append-only.** Every version transition records who,
    when, version before/after, and transition type. See domain-model.md §5.4.

## 6. Authorization

25. **Authorization decisions are made in services
    (`MembershipService.can`), never in the UI.** The UI may hide controls
    for UX, but a hidden control is not authorization — the service must
    re-check on mutation.
26. **Permission keys are explicit strings, enumerated per resource.** No
    wildcard "admin" checks. Each operation has a named permission.
27. **Roles are bundles of permissions; Memberships bind users to roles.**
    Never put a role on User; a user's powers depend on the org they're acting
    in.

## 7. Data safety

28. **Never `DROP`, `DELETE` columns, change column types, or rename tables.**
    These lose user data. Use additive migrations.
29. **Soft-delete entities (status = `deleted`); never hard-delete on first
    request.** A retention window applies before purge.
30. **Raw secrets never live in domain entities.** AnalyticsProfile stores
    credential references, not keys. Secrets live in platform secret storage.
31. **Append-only data (Submissions, PageSnapshots, DomainEvents) is never
    mutated.** Only status transitions are allowed on submissions; snapshots
    and events are fully immutable.

## 8. Plugin lifecycle

32. **Plugins extend, they do not modify core.** A plugin cannot alter
    existing SectionType schemas or core entities. It registers new
    contributions.
33. **Plugin-contributed SectionTypes go through the same
    `SectionTypeRegistry` as platform ones.** No parallel registration path.
34. **Plugin lifecycle is: registered → installed → enabled → disabled →
    uninstalled.** See domain-model.md §6. Disabling preserves existing
    content; uninstalling renders fallbacks.
35. **Plugins declare what they contribute and require; the platform enforces
    the manifest.** `requiresPlatformVersion` and `requiresFeatures` are
    validated at registration and installation.
36. **Plugin installation is per-Organization.** A plugin may choose to scope
    its features per-website, but the installation record is org-level.

## 9. Domain events

37. **Domain events are facts, not commands.** Past tense, immutable, plain
    data. No behavior, no methods. See domain-model.md §7.
38. **Events are owned by the emitting context.** The `events` context
    aggregates the vocabulary but does not own the emission logic.
39. **No event bus in the domain package.** Dispatch infrastructure (in-process,
    message queue, realtime) is a future infrastructure concern, not a domain
    contract.
40. **Subscribers depend on event contracts, not on emitting services.** This
    prevents coupling between contexts.

## 10. Extensibility

41. **New capabilities ship as Features + SectionTypes, not as core schema
    changes.** The domain is stable; plugins extend the registry.
42. **Platform-global resources (Plans, Features, system SectionTypes, system
    Themes, Plugins) are never tenant-owned.** Their types must reflect this.
43. **Every new entity gets: a bounded context folder in `@livingsites/domain`
    (`types.ts`, `enums.ts`, `index.ts`), a repository interface in
    `@livingsites/application/repositories/`, and a service interface in
    `@livingsites/application/services/`.** No orphan types in `shared`.

## 11. Conventions

44. **Use branded IDs (`OrganizationId`, `WebsiteId`, ...).** They prevent
    accidental cross-assignment at compile time. Never use bare `string` for
    an identifier.
45. **List methods take `PaginationParams` and return `PaginatedResult<T>`.**
    No unbounded queries from the UI.
46. **Operations that can fail return `Result<T, E>`.** Services surface
    errors as values, not exceptions, so the UI can render them deliberately.
47. **Enums are string-valued and exported from each context's `enums.ts`.**
    Avoid numeric enums; string enums serialize and log safely.
48. **No comments explaining what code does — only why, when non-obvious.**
    Names do the rest.

## 12. Composition root

49. **Only the composition package (`@livingsites/composition`) may
    instantiate concrete implementations.** No code outside this package may
    construct repositories, services, infrastructure providers, or factory
    implementations directly. This is the single place where contracts are
    bound to implementations.
50. **Application depends on abstractions, never on implementations.**
    `@livingsites/application` defines interfaces; it never imports a concrete
    class. Service implementations (future) are injected with their
    dependencies as constructor parameters typed against the contracts.
51. **Infrastructure is invisible to the UI.** The UI never imports from
    `@livingsites/infrastructure` or `@livingsites/composition`. It receives
    already-wired service instances and knows nothing about which database,
    storage, or email provider is in use.
52. **Repositories are injected, not globally accessed.** Services receive
    their repositories as constructor parameters from the composition root.
    No service looks up a repository from a registry or global at runtime.
53. **Services are injected, not globally accessed.** The UI/API entry point
    receives services from the composition root at boot. No component looks up
    a service from a registry or global at runtime. The UI holds direct
    references for the application's lifetime.
54. **Factories create complex objects.** When object construction requires
    data fetching, default-value resolution, multi-step assembly, or
    conditional logic, a factory (in the composition layer) creates the
    object. Services call factories; factories do not persist (that is the
    repository's job).
55. **No object graph may be manually assembled outside the composition
    package.** Any code that wires a repository into a service, or a provider
    into a repository, or a factory into a service, must live in
    `@livingsites/composition`. Tests are the sole exception — they may
    assemble mock object graphs, but only against the application-layer
    contracts.
56. **No DI framework.** Wiring is manual and explicit in the composition
    root. The object graph is simple enough that a framework adds indirection
    without value. A boot function creates providers → repositories →
    factories → services in order and returns a wired container.
57. **Service lifetimes are documented and enforced.** Providers and
    repositories are singleton. Most services are singleton.
    `BuilderService` is scoped (per builder session). Factories are transient
    or singleton depending on whether they carry per-call state. See
    `packages/composition/src/documentation/dependency-resolution.md`.

## 13. Platform runtime

58. **Platform (`@livingsites/platform`) contains provider-independent runtime
    capabilities only.** Configuration, environment, logging, telemetry,
    feature flags, clock, ID generation, health checks, and startup lifecycle.
    No business logic, no persistence, no provider-specific code.
59. **Infrastructure depends on Platform.** Infrastructure implementations
    (future `@livingsites/infrastructure`) use platform contracts (`Logger`,
    `Clock`, `IdGenerator`, `Config`, etc.) rather than inventing their own.
60. **Platform never depends on Infrastructure.** Platform is a leaf
    dependency — it imports no other `@livingsites/*` package. No import in
    `packages/platform/` may reference domain, application, composition, or
    infrastructure.
61. **Domain never imports Platform.** The domain package is pure business
    model. Runtime capabilities are irrelevant to it. No import in
    `packages/domain/` may reference `@livingsites/platform`.
62. **Application never imports Platform.** The application package defines
    service contracts; it does not depend on runtime capabilities. Services
    *use* platform capabilities at runtime (injected by composition), but the
    application package itself has no platform dependency.
63. **Application and UI consume Platform only through Composition.** The
    composition root wires platform capabilities into service implementations
    and the object graph. Neither application contracts nor UI code import
    platform directly.
64. **Runtime services must remain provider-agnostic.** Platform contracts
    (`Logger`, `Clock`, `TelemetrySink`, `FeatureFlagProvider`,
    `ConfigSource`, `HealthCheck`) use generic shapes. Mapping to a specific
    backend (OpenTelemetry, Datadog, LaunchDarkly, AWS AppConfig) is an
    infrastructure concern, never a platform concern.
65. **Platform capabilities are injected, not globally accessed.** Services
    receive their `Logger`, `Clock`, `IdGenerator`, `FeatureFlagProvider`,
    etc. as constructor parameters from the composition root. No service
    reaches for a global or singleton accessor at runtime.
66. **Platform secrets are references, not values.** The environment module
    returns `SecretRef` references; only infrastructure providers resolve a
    ref to the actual credential at connection time. No raw secret is ever
    logged, serialized, or passed through application or domain code.

## 14. Use case architecture

67. **Use cases contain business orchestration.** A use case coordinates
    authorization checks, repository reads, domain validation, repository
    writes, and event emission. It is the single place where a business
    operation's steps are ordered and combined.
68. **Repositories never contain business rules.** Repositories are data
    access contracts — get, insert, update, delete. No validation, no
    authorization, no cross-entity orchestration, no conditional logic beyond
    query filtering. A repository that grows business logic is a defect.
69. **Services never bypass use cases.** Service implementations call use
    case methods. No service writes to a repository outside a use case. No
    service emits events outside a use case.
70. **Every mutation originates from a use case.** No code outside a use case
    calls repository write methods (insert, update, delete). The UI, API
    routes, background jobs, and event subscribers all go through use cases
    to mutate state.
71. **Queries never mutate state.** A query use case has no write path. It
    reads from repositories and returns a read model. It does not insert,
    update, or delete — not even "harmless" counters or timestamps.
72. **Commands never return read models.** A command use case returns
    `Result<T, DomainError>` where `T` is the mutated entity (or a handle for
    long-running operations). If the UI needs a display shape, it issues a
    separate query.
73. **Background jobs execute use cases.** A background job is a trigger
    (schedule or queue) that calls a use case. It contains no business logic
    of its own — it delegates entirely to the use case it triggers.
74. **Events are emitted only by completed use cases.** The event emission is
    the last action of a successful use case, before returning `Result.ok`. A
    failed use case emits nothing.
75. **Use cases are organized by bounded context.** Each use case belongs to
    exactly one context folder in `packages/application/src/use-cases/`. No
    use case spans two contexts — cross-context reactions happen via events,
    not via direct use-case calls.
76. **The use case catalog is the master list of business operations.** Every
    capability of the platform must appear in `docs/use-cases.md`. If an
    operation is not in the catalog, it does not exist. New operations are
    added to the catalog before implementation.

## 15. Business policy architecture

77. **Business policies are independent of authorization.** Authorization
    determines *who* can act (identity + membership). Policies determine
    *whether business state permits* the action (plan limits, content
    constraints, lifecycle rules). A use case checks authorization first,
    then policies. Neither replaces the other.
78. **Use cases evaluate policies before mutations.** Policy evaluation
    happens after authorization and feature flag checks but before any
    repository write. If a policy denies, the use case returns an error and
    does not mutate. No mutation, no event emission on denial.
79. **Policies never access repositories directly.** Policies receive all
    data they need as inputs. The use case fetches data from repositories and
    passes it to the policy. A policy that calls a repository is a defect —
    it creates hidden data dependencies and makes the policy
    non-deterministic.
80. **Policies depend only on contracts.** A policy's inputs are plain data
    (entities, value objects, plan summaries, counts). A policy's output is a
    `PolicyDecision`. No policy imports a repository, service, infrastructure
    provider, or platform runtime capability.
81. **Policies are reusable.** A policy is defined once and used by any use
    case that needs it. `StorageQuotaPolicy` is used by both `UploadMedia` and
    `CreatePage` (if it involves storage). No use case re-implements a policy
    inline.
82. **Policies are deterministic.** Given the same inputs, a policy always
    returns the same decision. No random values, no time-based logic (the
    current time is an input, not a global), no external state. The only
    exception is async policies that depend on external screening results —
    and even then, the screening result is an input, not a side effect.
83. **Feature flags are inputs to policies, not policies themselves.** A
    feature flag evaluation result (`boolean`) is passed to a policy via
    `PolicyContext.featureFlags`. The policy may use the flag value in its
    evaluation (e.g. `BuilderEntitlementPolicy` checks both plan entitlement
    and feature flag). The flag is not the decision — the policy is.
84. **Subscription plans influence policies.** A `PlanSummary` is part of the
    `PolicyContext`. Policies use plan limits (`maxWebsites`, `maxStorageBytes`)
    and entitlements (`features`) to evaluate constraints. Plan changes
    automatically affect policy outcomes because the plan is an input, not
    hardcoded.
85. **Policy chains short-circuit on hard denials.** When a policy in a chain
    returns a hard denial, the chain stops — subsequent policies are not
    evaluated. Warnings (soft decisions) are accumulated but do not stop the
    chain.
86. **Policy overrides are explicit and auditable.** An override records
    which policy was overridden, by whom, and why. Overrides are never silent.
    The `PolicyContext` may include an `overrideReason` — if present, the
    chain records the override in its decisions but does not deny.
87. **The policy catalog is the master list of business rules.** Every
    policy must appear in `docs/policies.md`. If a policy is not in the
    catalog, it does not exist. New policies are added to the catalog before
    implementation.
88. **Policies are organized by bounded context.** Each policy belongs to
    exactly one context folder in `packages/application/src/policies/`. A
    policy chain may borrow policies from multiple contexts, but the policy's
    ownership is singular.

## 16. Ports & Adapters (Infrastructure)

89. **Application depends on ports, not adapters.** The application layer
    defines repository interfaces (ports). It never imports
    `@livingsites/infrastructure` or any adapter contract. Use cases depend
    on `PageRepository`, not on `DatabaseAdapter`.
90. **Infrastructure implements ports.** The infrastructure package provides
    adapter contracts and (in future milestones) concrete implementations
    that fulfill application-layer repository interfaces. A
    `PageRepositoryAdapter` implements `PageRepository` — the use case sees
    no difference.
91. **Providers implement adapters.** A concrete provider implementation
    (e.g. a Supabase database adapter) implements the `DatabaseAdapter`
    contract. The adapter contract is provider-agnostic; the provider
    implementation is provider-specific. No adapter contract names a
    specific provider.
92. **Composition wires implementations.** The composition root is the only
    place that knows which concrete adapter implementations are used. It
    instantiates providers, passes them to repository adapter
    implementations, and binds the result to application-layer ports.
93. **Business logic never imports infrastructure.** No file in
    `packages/domain/`, `packages/application/src/use-cases/`,
    `packages/application/src/services/`, or `packages/application/src/policies/`
    may import `@livingsites/infrastructure`. Business logic is pure of
    provider concerns.
94. **Infrastructure depends on Platform and Application, never the reverse.**
    Infrastructure uses platform runtime capabilities (`Logger`, `Clock`,
    `IdGenerator`, `Config`) and implements application contracts
    (`PageRepository`, `OrganizationRepository`). Neither platform nor
    application imports infrastructure.
95. **Adapter contracts are provider-agnostic.** No adapter contract
    (`DatabaseAdapter`, `StorageAdapter`, `EmailAdapter`, etc.) references a
    specific provider (Supabase, Resend, S3, Redis, etc.). Provider
    specificity lives only in concrete implementations, not in contracts.
96. **Repository adapters extend application contracts.** A repository
    adapter contract (e.g. `PageRepositoryAdapter`) extends the
    application-layer repository interface (e.g. `PageRepository`) and adds
    infrastructure lifecycle methods (`initialize`, `healthCheck`, `close`).
    The application contract remains unchanged.
97. **Adapters use platform runtime capabilities.** Every adapter contract
    accepts a `Logger` (and where relevant, `Clock`, `IdGenerator`,
    `Config`). Adapters never construct their own logging or time — they
    receive platform capabilities via injection.
98. **The infrastructure package is the lowest layer.** Nothing depends on
    infrastructure except the composition root. Infrastructure depends on
    platform, application, and domain — nothing below it.

## 17. Aggregate and Persistence

99. **Aggregate definitions belong to the Domain layer.** Aggregate roots,
    child entities, invariants, value objects, and consistency boundaries
    are domain concepts. They live in `packages/domain/src/aggregates/`. The
    Application layer defines repository contracts and use cases that operate
    through aggregate-root repositories — it does not define aggregate
    boundaries.
100. **Application use cases operate through aggregate-root repositories
     only.** A use case that needs to mutate a Page calls
     `PageRepository.save(page)`, which atomically persists the page and all
     its sections. A use case never calls a child-entity repository directly.
101. **Aggregate children never have public repository ports.** Section
     (child of Page), FormField (child of Form), MenuItem (child of
     Navigation), and WebsiteSettings (child of Website) have no standalone
     application-facing repository interfaces. They are loaded, mutated, and
     persisted through their aggregate root's repository.
102. **Infrastructure table mappers are private implementation details.** A
     database adapter may use internal table mappers (e.g. a `sections` table
     mapper within the `PageRepositoryAdapter`), but these are never exposed
     as Application-layer ports. The application sees only the aggregate-root
     repository contract.
103. **Repositories own Aggregate Roots only.** A repository persists one
     aggregate root and its child entities. There is no repository for a
     child entity that operates independently of its root.
104. **Transactions never cross Aggregate boundaries.** A single database
     transaction persists exactly one aggregate. Cross-aggregate coordination
     uses domain events, eventual consistency, or saga patterns.
105. **Read models are immutable.** A read model is a projection of aggregate
     state at a point in time. It is never mutated in place by a use case.
     Every read model carries `ReadModelMetadata` with `computedAt`,
     `sourceVersion`, and `projectionVersion`.
106. **Aggregates enforce invariants.** The aggregate root validates that
     its internal state is consistent before accepting a mutation.
107. **Snapshots are append-only.** A `PageSnapshot` is never modified after
     creation. No UPDATE on snapshot rows. A new publish creates a new
     snapshot. Old snapshots are retained indefinitely.
108. **Every mutable aggregate root contract requires `version:
     AggregateVersion`.** The field is mandatory on every mutable aggregate
     root entity interface. The TypeScript compiler enforces its presence —
     a mutable root without `version` does not compile. Immutable aggregates
     (PageSnapshot, domain-event records) do not carry this field. Provider-
     specific version enforcement is an infrastructure concern — Domain and
     Application define only the type and the contract.
109. **The final-owner invariant is transactionally enforced.** An
     Organization must always retain at least one active owner. Removing,
     demoting, archiving, or transferring the final active owner executes
     through a dedicated transaction boundary with strong consistency using
     an implementation-appropriate concurrency mechanism. This is not
     handled by optimistic concurrency alone. Platform-admin recovery is
     emergency remediation only, not normal consistency handling.
110. **No generic AggregateRoot framework or superclass is introduced
     without a separate approved ADR.** Aggregates are plain domain entities
     with documented boundaries. No base class, no decorator, no runtime
     framework — unless a future ADR approves one.
111. **References between aggregates are by ID only.** An aggregate holds
     the ID of another aggregate, never a direct object reference.
112. **Aggregates are loaded eagerly.** When a repository loads an aggregate
     root, it loads all child entities and value objects in the same
     transaction. No lazy loading within an aggregate.
113. **Persistence follows aggregate boundaries, not table boundaries.** A
     repository's `save` method persists the entire aggregate (root +
     children) in one transaction. The database schema is an implementation
     detail of the infrastructure layer.
114. **Child entities share the aggregate root's concurrency boundary.**
     Section, FormField, MenuItem, and WebsiteSettings do not carry an
     independent `AggregateVersion`. A change to any child increments the
     root's version exactly once. The root's version is the single
     concurrency token for the entire aggregate.
115. **Every mutable aggregate-root repository `save` contract requires
     `expectedVersion`.** The save method accepts the aggregate as the first
     parameter and `expectedVersion: AggregateVersion` as the second. A
     successful save increments the version exactly once. A version mismatch
     returns a typed `ConcurrencyConflict` as part of a `SaveResult<T>`. The
     `PageSnapshotRepository.save` method does not require `expectedVersion`
     — snapshots are immutable.
116. **Concurrency conflicts are returned as typed results and never
     swallowed.** A repository save returns `SaveResult<T>` (which is
     `Result<T, RepositoryError | ConcurrencyConflict>`). Use cases propagate
     the error to the caller. No `catch` that ignores a concurrency
     conflict. No silent retry.
117. **Automatic retries are allowed only for explicitly safe, idempotent
     operations.** A concurrency conflict means the aggregate was modified
     by another operation. The caller must reload and re-evaluate before
     retrying. Blind retries are prohibited. Only operations that are
     idempotent (e.g. setting a flag to a specific value regardless of
     intermediate changes) may retry automatically, and only with a bounded
     retry count.
118. **The initial-version convention is version 0 before first persistence,
     version 1 after the first successful save.** A new aggregate is
     constructed with `version: INITIAL_AGGREGATE_VERSION` (0). The caller
     passes `expectedVersion: 0` to the first save. On success, the stored
     version becomes 1. No aggregate uses a different starting version.
119. **Domain expresses business consistency conflicts, but repository and
     persistence failures belong to Application contracts.**
     `ConcurrencyConflict` and `AggregateVersion` live in
     `@livingsites/domain` — they express that two operations conflicted
     over the same aggregate state. `RepositoryError`, `SaveResult`,
     `CreateResult`, `CreateError`, `SaveError`, `DuplicateKeyError`,
     `PersistenceUnavailableError`, `InvalidPersistenceStateError`, and
     `MutationResult` live in `@livingsites/application` — they describe
     repository-operation outcomes (persistence failures, duplicate keys,
     transport errors). Domain must not contain repository, database,
     provider, transport, or infrastructure error concepts.
120. **Repository creation and mutation are separate operations.** Each
     mutable aggregate-root repository defines `create(candidate)` and
     `save(aggregate, expectedVersion)` as distinct methods. `create`
     takes a candidate type that omits persistence-generated fields (id,
     audit, version) and returns `CreateResult<T>` (version 1 on success).
     `save` takes an existing aggregate with an ID and `expectedVersion`,
     returns `SaveResult<T>`, and increments the version exactly once.
     Creation conflicts return typed Application errors
     (DuplicateKeyError, PersistenceUnavailableError) — never
     ConcurrencyConflict. `softDelete`, `archive`, `restore`, and status
     transitions require `expectedVersion`. `PageSnapshotRepository.create`
     is immutable append-only and does not use `expectedVersion`.
121. **AggregateVersion is reserved exclusively for optimistic concurrency
     on mutable aggregate roots.** PageSnapshot must not use a field named
     `version` for publication history. PageSnapshot uses `revisionNumber`
     (immutable, monotonically increasing per Page, unique per pageId).
     Optional human-facing release labels use `releaseVersion` (a
     VersionString), separate from `revisionNumber`. No entity outside a
     mutable aggregate root carries `AggregateVersion`.

## 18. What does NOT exist yet

This milestone produces architecture only. The following are explicitly
**out of scope and must not be implemented** until a later milestone:

- Authentication (sign-in, sessions, password reset)
- Database implementation (migrations, RLS policies, seed data)
- CRUD endpoints / API routes
- Dashboards or any UI
- Page builder
- Media library implementation
- Business logic implementations of any service
- Sample data or demo pages
- Event bus / event dispatcher
- Plugin runtime

Any PR introducing these before its milestone is out of scope and should be
rejected.
