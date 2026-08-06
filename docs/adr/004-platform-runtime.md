# ADR 004 — Platform Runtime Layer

> **Status:** Accepted

## Context

The platform needs cross-cutting runtime capabilities — configuration,
logging, telemetry, feature flags, clock, ID generation, health checks, and
lifecycle management — that every infrastructure provider and service
implementation depends on. Without a dedicated layer for these, each
infrastructure implementation would invent its own logging interface, clock
abstraction, and config loader, leading to duplication and inconsistency.
Alternatively, these capabilities could be placed in the infrastructure
package, but that would make it impossible to depend on them without also
depending on concrete persistence implementations.

Forces:

- Runtime capabilities must be provider-independent (the same `Logger`
  serves Supabase and a future Postgres-direct implementation).
- Infrastructure depends on these capabilities, so they must sit *below*
  infrastructure in the dependency graph.
- Domain and application must not depend on runtime capabilities — they are
  pure contracts and entities.
- The capabilities must be testable (fake clocks, deterministic ID
  generators, no-op loggers).
- Secrets must never leak into logs, application, or domain code.

## Decision

Create a dedicated `@livingsites/platform` package containing
**provider-independent runtime capability contracts** only. It is a leaf
dependency — it imports no other `@livingsites/*` package. Infrastructure
depends on platform; composition wires platform capabilities into the object
graph; application and domain never import platform.

Structure: 10 modules under `src/` (config, environment, startup, logging,
telemetry, feature-flags, clock, ids, health), each with a `README.md`
(responsibilities and principles) and an `index.ts` (contracts). No
implementation, no runtime behavior, no provider-specific code.

Secrets are modeled as `SecretRef` references — opaque keys that only
infrastructure providers resolve to actual credentials at connection time.

## Consequences

- **Positive:** Runtime capabilities are defined once and reused across all
  infrastructure providers. Swapping a telemetry backend or feature flag
  provider is an infrastructure change, not a platform or service change.
  Domain and application remain pure. Secrets are isolated by construction.
  Tests inject fakes against the same contracts. A lint rule can enforce
  that domain and application never import platform.
- **Negative:** A fourth package adds build-order complexity (domain →
  application → composition; platform builds independently but composition
  depends on it). The `workspace:*` protocol issue persists. Some contracts
  (feature flags) use string IDs rather than domain branded types, because
  platform cannot depend on domain — the composition root bridges this at
  wiring time.
- **Neutral:** Platform is a wide, flat package (10 modules) but each module
  is small and independent. Most modules have no internal platform
  dependencies and can be wired in parallel.

## Alternatives Considered

- **Capabilities in infrastructure.** Put logging, clock, config, etc. in the
  infrastructure package. Rejected because every infrastructure consumer
  would then depend on concrete persistence implementations to get a logger.
  Provider swaps would cascade.
- **Capabilities in composition.** Put runtime capabilities in the
  composition root. Rejected because the composition root is for *wiring*,
  not for *defining* contracts. Co-locating them would force composition to
  be a dependency of infrastructure, inverting the dependency direction.
- **Capabilities in application.** Put runtime contracts in the application
  package alongside service contracts. Rejected because it would make domain
  transitively dependent on runtime concerns (if domain ever needed a type
  from application), and it mixes orchestration contracts with runtime
  contracts.
- **Utility package with no contracts.** Put helper functions (logging, clock)
  in a shared utility package with concrete implementations. Rejected because
  it breaks injectability and testability — services would call concrete
  functions instead of injected interfaces, making fakes impossible.
