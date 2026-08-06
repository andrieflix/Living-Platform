# Living Sites — Application Flow

> **Status:** Architecture only. No implementation in this milestone.

## Overview

This document describes how a user request flows through the Living Sites
architecture — from the UI, through a use case, through repositories, through
platform runtime capabilities, through infrastructure providers, to external
systems. It covers three flow types: **command flow** (mutations), **query
flow** (reads), and **event flow** (asynchronous reactions).

## Dependency Stack

```
User Request
    ↓
UI / API Layer
    ↓
Use Case (business orchestration)
    ↓
Repositories (data access contracts)
    ↓
Platform Runtime (logging, clock, ids, telemetry, feature flags)
    ↓
Infrastructure Providers (concrete implementations)
    ↓
External Systems (Supabase Postgres, Storage, Analytics SDKs, Email, Queues)
```

Every layer depends on the contract of the layer below. No layer skips a
level. The UI never calls a repository. A repository never calls an external
system directly — it goes through an infrastructure provider. Platform
runtime capabilities are injected at every level by the composition root.

## Command Flow

A **command** is a use case that mutates state. Commands return
`Result<T, DomainError>`, never read models. Every mutation in the platform
originates from a command use case — there is no other path to mutate data.

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI / API
    participant UC as Use Case
    participant Auth as Authorization
    participant Repo as Repository
    participant Plat as Platform (Clock, IDs, Logger)
    participant Infra as Infrastructure Provider
    participant Ext as External System
    participant Bus as Event Bus (future)

    U->>UI: action (e.g. "Publish Page")
    UI->>UC: execute(PublishPage command)
    UC->>Auth: check permission (website.admin)
    Auth-->>UC: allowed
    UC->>Repo: get current draft (PageRepository)
    Repo->>Infra: query
    Infra->>Ext: SELECT page + sections
    Ext-->>Infra: rows
    Infra-->>Repo: entities
    Repo-->>UC: Page + Sections
    UC->>UC: validate sections against schemas
    UC->>Plat: nowIso() for snapshot timestamp
    UC->>Plat: generate() for snapshot id
    UC->>Repo: create snapshot (PageSnapshotRepository)
    Repo->>Infra: insert
    Infra->>Ext: INSERT snapshot
    Ext-->>Infra: ok
    Infra-->>Repo: entity
    Repo-->>UC: PageSnapshot
    UC->>Repo: update page status → published
    Repo->>Infra: update
    Infra->>Ext: UPDATE page SET status='published'
    Ext-->>Infra: ok
    Infra-->>Repo: entity
    Repo-->>UC: Page
    UC->>Bus: emit PagePublished event
    UC-->>UI: Result.ok({ page, snapshot })
    UI-->>U: success
```

### Command rules

1. **Every mutation originates from a use case.** No code outside a use case
   writes to a repository.
2. **Commands never return read models.** A command returns the mutated
   entity or a `DomainError`. If the UI needs a read model after a mutation,
   it issues a separate query.
3. **Authorization is checked inside the use case**, not in the UI. The UI may
   hide controls for UX, but the use case re-checks on execution.
4. **Events are emitted only after the use case completes successfully.** If
   the use case fails (returns an error), no event is emitted.
5. **Platform capabilities (clock, IDs) are used inside the use case** to
   generate timestamps and identifiers — never `Date.now()` or
   `crypto.randomUUID()` directly.

## Query Flow

A **query** is a use case that reads state. Queries never mutate. Queries
return read models (DTOs), not domain entities — the UI receives shapes
designed for display, not internal entity structures.

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI / API
    participant UC as Use Case (Query)
    participant Auth as Authorization
    participant Repo as Repository
    participant Infra as Infrastructure Provider
    participant Ext as External System
    participant Cache as Cache (optional)

    U->>UI: view (e.g. "Show page list")
    UI->>UC: execute(ListPages query)
    UC->>Auth: check permission (website member)
    Auth-->>UC: allowed
    UC->>Cache: check cache (optional)
    alt cache hit
        Cache-->>UC: cached read model
    else cache miss
        UC->>Repo: list pages by website (PageRepository)
        Repo->>Infra: query with pagination
        Infra->>Ext: SELECT pages WHERE website_id = ?
        Ext-->>Infra: rows
        Infra-->>Repo: entities
        Repo-->>UC: PaginatedResult<Page>
        UC->>UC: map entities to read model (DTO)
        UC->>Cache: store read model (optional)
    end
    UC-->>UI: PageListReadModel
    UI-->>U: render list
```

### Query rules

1. **Queries never mutate state.** A query use case has no write path — it
   does not call insert/update/delete on any repository.
2. **Queries return read models, not entities.** The mapping from entity to
   read model happens inside the query use case, so the UI never sees internal
   entity shapes.
3. **Queries may use caching.** A query may check a cache before hitting the
   repository. Cache invalidation is triggered by events (see Event Flow).
4. **Queries enforce authorization.** A query checks that the caller has
   permission to read the requested data — tenant isolation is a query
   concern, not just a command concern.

## Event Flow

An **event** is a fact about a completed use case. Events flow
asynchronously: a command use case emits an event after it succeeds, and
other contexts react to that event by executing their own use cases.

```mermaid
sequenceDiagram
    participant UC1 as Use Case (Content)
    participant Bus as Event Bus (future)
    participant UC2 as Use Case (SEO)
    participant UC3 as Use Case (Analytics)
    participant Job as Background Job Scheduler
    participant Repo as Repository
    participant Ext as External System

    UC1->>UC1: PublishPage (command)
    UC1->>Bus: emit PagePublished event
    Note over Bus: Event is a fact —<br/>past tense, immutable

    par SEO reacts
        Bus->>UC2: PagePublished
        UC2->>UC2: RegenerateSitemap (background job)
        UC2->>Repo: read published pages
        Repo->>Ext: SELECT published pages
        Ext-->>Repo: rows
        Repo-->>UC2: pages
        UC2->>UC2: generate sitemap XML
        UC2->>Repo: store sitemap
        UC2->>Bus: emit SitemapRegenerated
    and Analytics reacts
        Bus->>UC3: PagePublished
        UC3->>Repo: register page URL with analytics provider
        Repo->>Ext: POST to analytics API
        Ext-->>Repo: ok
    end

    Note over Job: Scheduled jobs also execute use cases
    Job->>UC1: ExecuteScheduledPublish (background)
    UC1->>UC1: PublishPage (command) — same use case
```

### Event rules

1. **Events are emitted only by completed use cases.** A failed use case
   emits nothing.
2. **Events are facts, not commands.** Past tense (`PagePublished`, not
   `PublishPage`), immutable, plain data.
3. **Events are owned by the emitting context.** The content context owns
   `PagePublished`; the SEO context subscribes to it.
4. **Subscribers depend on event contracts, not on emitting services.** The
   SEO context knows about `PagePublished` (an event contract), not about
   `PageService` (a service contract).
5. **Background jobs execute use cases.** A background job is not separate
   logic — it calls the same use case a user would, just triggered by a
   schedule or queue instead of a user request.
6. **Event flow is asynchronous.** The emitting use case does not wait for
   subscribers. If a subscriber fails, it retries independently — the
   original use case has already succeeded.

## Full Request Flow (Combined)

This diagram shows the complete dependency chain from user request to
external system, including platform runtime capabilities at each layer.

```mermaid
flowchart TD
    User["User"] --> UI["UI / API Layer"]
    UI -->|"invokes"| UC["Use Case<br/>(business orchestration)"]
    UC -->|"checks"| Auth["Authorization<br/>(MembershipService)"]
    UC -->|"reads/writes"| Repo["Repository<br/>(data access contract)"]
    UC -->|"uses"| Plat["Platform Runtime<br/>(Clock, IDs, Logger,<br/>Telemetry, Feature Flags)"]
    Repo -->|"implemented by"| Infra["Infrastructure Provider<br/>(concrete implementation)"]
    Infra -->|"talks to"| Ext["External Systems<br/>(Supabase, Analytics,<br/>Email, Queues)"]
    UC -->|"emits on success"| Events["Domain Events<br/>(PagePublished, etc.)"]
    Events -->|"trigger"| Subscribers["Other Use Cases<br/>(RegenerateSitemap,<br/>SyncMetrics)"]
    Subscribers -->|"reads/writes"| Repo

    Plat -->|"injected by"| Comp["Composition Root<br/>(wires everything)"]
    Repo -->|"injected by"| Comp
    UC -->|"injected by"| Comp

    style UC fill:#e8f0fe
    style Plat fill:#e8f5e9
    style Ext fill:#fff3e0
    style Events fill:#fce4ec
```

## Background Job Flow

Background jobs are triggered by either a schedule (cron) or a queue (event-
driven). They execute use cases — they are not separate logic.

```mermaid
flowchart LR
    subgraph Triggers
        Schedule["Scheduled Trigger<br/>(cron)"]
        Queue["Queue Trigger<br/>(event-driven)"]
    end

    subgraph Execution
        Job["Background Job<br/>(ExecuteScheduledPublish,<br/>RegenerateSitemap,<br/>GenerateThumbnails)"]
        UC["Use Case<br/>(PublishPage,<br/>RegenerateSitemap,<br/>ProcessUpload)"]
    end

    subgraph Dependencies
        Repo["Repository"]
        Plat["Platform Runtime"]
        Infra["Infrastructure"]
    end

    Schedule --> Job
    Queue --> Job
    Job -->|"executes"| UC
    UC -->|"uses"| Repo
    UC -->|"uses"| Plat
    Repo --> Infra

    style Job fill:#e8f0fe
    style UC fill:#e8f0fe
```

## Long-running Operation Flow

Long-running operations span more than one request. They involve a start
command, a background execution phase, and a completion event.

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI / API
    participant UC as Use Case
    participant Queue as Queue Provider
    participant Job as Background Worker
    participant Repo as Repository
    participant Ext as External System

    U->>UI: "Export website"
    UI->>UC: StartExportJob (command)
    UC->>Repo: create job record (status=queued)
    UC->>Queue: enqueue job
    UC-->>UI: Result.ok(jobHandle)
    UI-->>U: "Export started — we'll notify you"

    Note over Job: Background (async)
    Job->>Queue: dequeue job
    Job->>UC: ExecuteExport (use case)
    UC->>Repo: update job status=running
    UC->>Repo: gather published snapshots
    Repo->>Ext: SELECT snapshots
    Ext-->>Repo: rows
    UC->>UC: render to target format
    UC->>Repo: upload output to storage
    Repo->>Ext: PUT to storage
    UC->>Repo: update job status=completed
    UC->>Queue: emit ExportJobCompleted event
    Note over UI: UI polls or receives realtime update
    UI-->>U: "Export ready — download here"
```

## Key Invariants

| Invariant | Enforcement |
|---|---|
| Every mutation originates from a use case. | No code outside `use-cases/` calls repository write methods. Lint rule + review. |
| Queries never mutate state. | Query use cases have no write-path repository calls. Review + test. |
| Commands never return read models. | Command return types are `Result<Entity, DomainError>`, not DTOs. Type system. |
| Events emitted only by completed use cases. | The event emission call is the last line before `Result.ok`. Review. |
| Background jobs execute use cases. | Background job functions call use case methods — no inline business logic. Review. |
| Repositories never contain business rules. | Repository interfaces are data-access only (get, insert, update, delete). No validation, no authorization, no orchestration. Interface shape + review. |
| Services never bypass use cases. | Service implementations call use case methods — no direct repository writes outside a use case. Review. |
