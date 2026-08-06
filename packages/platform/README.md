# @livingsites/platform — Platform Runtime Layer

> **Status:** Architecture only. No implementation, no runtime behavior, no
> provider-specific code in this milestone.

## What this package is

The platform package contains **provider-independent runtime capabilities**
that every application in Living Sites depends on: configuration, environment,
startup, logging, telemetry, feature flags, clock, ID generation, and health
checks. These are cross-cutting runtime concerns — not business concerns
(domain), not persistence concerns (infrastructure), and not orchestration
concerns (composition).

## What this package is NOT

- **Not infrastructure.** Platform defines contracts; infrastructure
  implements them and depends on platform. Platform never depends on
  infrastructure.
- **Not domain.** Platform has no business entities. Domain never imports
  platform.
- **Not application.** Application defines service contracts; platform
  provides runtime capabilities that services *use* but do not *define*.
- **Not composition.** Composition wires concrete implementations; platform
  defines the contracts that composition wires.

## Package structure

```
packages/platform/
├── README.md                  ← you are here
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts               ← root barrel
    ├── config/                ← typed application configuration
    ├── environment/           ← env vars and secret references
    ├── startup/               ← application lifecycle (startup + shutdown)
    ├── logging/               ← structured, leveled logging
    ├── telemetry/             ← metrics and tracing
    ├── feature-flags/         ← dynamic runtime feature flags
    ├── clock/                 ← time abstraction
    ├── ids/                   ← unique identifier generation
    └── health/                ← liveness and readiness checks
```

Each module contains a `README.md` (responsibilities and principles) and an
`index.ts` (export placeholders / contracts). No implementation.

## Dependency direction

```
Infrastructure  →  Platform  →  (nothing internal)
Composition      →  Platform  (wires capabilities into providers)
Application      →  NEVER imports Platform
Domain           →  NEVER imports Platform
UI               →  NEVER imports Platform directly
```

Platform is a leaf dependency: it depends on no other `@livingsites/*`
package. Infrastructure depends on platform (e.g. a Supabase repository
implementation uses the platform `Logger`, `Clock`, and `IdGenerator`).
Composition wires platform capabilities into the object graph. Application
and domain never import platform — they are pure contracts and entities.

## Why a separate package

- **Physical enforcement of the layer boundary.** If platform were a folder
  inside infrastructure, the rule "domain never imports platform" would be
  hard to enforce. A separate package makes it a lint rule: no file in
  `packages/domain/` or `packages/application/` may import
  `@livingsites/platform`.
- **Reuse across infrastructure implementations.** Every infrastructure
  provider (database, storage, analytics, email) needs logging, clock, IDs,
  and config. Defining these once in platform avoids duplication across
  providers.
- **Provider agnosticism.** Platform contracts are generic. The same
  `Logger` interface serves a Supabase implementation and a future
  Postgres-direct implementation. Swapping infrastructure does not change
  platform.
- **Testability.** Platform contracts are interfaces. Tests inject fake
  clocks, deterministic ID generators, no-op loggers, and in-memory feature
  flag providers.
