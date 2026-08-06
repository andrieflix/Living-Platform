# @livingsites/infrastructure — Infrastructure Layer

> **Status:** Architecture only. No provider implementations, no database, no
> runtime behavior in this milestone.

## What this package is

The infrastructure package implements the **Ports & Adapters** (Hexagonal)
architecture for Living Sites. It defines adapter contracts that represent
provider capabilities — database, storage, search, email, cache, queue,
telemetry, and logging — and repository adapter contracts that adapt the
application layer's repository interfaces to infrastructure providers.

Infrastructure is where concrete provider implementations will live in future
milestones (e.g. a Supabase database adapter, a Supabase storage adapter, a
Resend email adapter). This milestone defines only the contracts and folder
structure.

## What this package is NOT

- **Not application.** Infrastructure implements application contracts; it
  does not define business use cases, services, or policies.
- **Not domain.** Infrastructure uses domain entities for persistence shapes;
  it does not define business entities.
- **Not platform.** Infrastructure depends on platform runtime capabilities
  (logging, clock, IDs, config); it does not define them.
- **Not composition.** Composition wires infrastructure implementations into
  the object graph; infrastructure does not wire itself.

## Package structure

```
packages/infrastructure/
├── README.md                   ← you are here
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                ← root barrel
    ├── adapters/               ← provider-capability adapter contracts
    │   ├── index.ts
    │   ├── database/           ← DatabaseAdapter (query, transaction, migrate)
    │   ├── storage/            ← StorageAdapter (upload, download, presign, delete)
    │   ├── search/             ← SearchAdapter (index, query, delete)
    │   ├── email/              ← EmailAdapter (send, batch, template)
    │   ├── cache/              ← CacheAdapter (get, set, delete, expire)
    │   ├── queue/              ← QueueAdapter (enqueue, dequeue, ack, retry)
    │   ├── telemetry/          ← TelemetryAdapter (metrics, traces export)
    │   └── logging/            ← LoggerAdapter (structured log sink)
    ├── repositories/           ← repository adapter contracts
    │   ├── index.ts
    │   ├── organization/       ← OrganizationRepositoryAdapter
    │   ├── website/            ← WebsiteRepositoryAdapter
    │   ├── page/               ← PageRepositoryAdapter, PageSnapshotRepositoryAdapter
    │   ├── section/            ← SectionRepositoryAdapter
    │   ├── media/              ← MediaRepositoryAdapter
    │   └── form/               ← FormRepositoryAdapter
    └── providers/              ← provider registration contracts (future)
        ├── index.ts
        └── README.md
```

Each leaf module contains a `README.md` (purpose and contract overview) and an
`index.ts` (interfaces only). No implementations.

## Dependency direction

```
Composition  →  Infrastructure  →  Application (contracts)
                              →  Platform (runtime capabilities)
                              →  Domain (entity types)

Application   →  NEVER imports Infrastructure
Domain        →  NEVER imports Infrastructure
Platform      →  NEVER imports Infrastructure
UI / API      →  NEVER imports Infrastructure directly (only through Composition)
```

Infrastructure depends on application (for repository contract signatures it
adapts), platform (for logging, clock, IDs, config), and domain (for entity
types). The composition root is the only package above infrastructure that
may import it — it wires concrete adapter implementations into the object
graph.

## Ports & Adapters

The architecture uses the Ports & Adapters pattern:

- **Ports** are the application-layer interfaces (repository contracts,
  service contracts). The application defines ports; it does not know which
  adapter implements them.
- **Adapters** are the infrastructure-layer interfaces that represent
  provider capabilities. An adapter is a port at the infrastructure level —
  it defines what a provider can do (query, upload, send email) without
  naming a specific provider.
- **Providers** are concrete implementations of adapters (future milestone).
  A Supabase database adapter implements `DatabaseAdapter`. A Resend email
  adapter implements `EmailAdapter`. The composition root selects which
  provider implementation to use.

This separation means:

1. The application layer defines **what** data operations exist (ports).
2. The infrastructure layer defines **what capabilities** providers offer
   (adapters).
3. Future provider implementations define **how** a specific service fulfills
   those capabilities.
4. The composition root **wires** the chosen provider to the port.
