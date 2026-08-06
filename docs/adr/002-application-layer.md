# ADR 002 — Application Layer

> **Status:** Accepted

## Context

With the domain layer isolated (ADR 001), repository and service contracts
needed a home. These contracts define *what operations exist* and *what
persistence shape is expected*, without defining *how* they are implemented.
Keeping them in the domain package mixed business entities with data-access
concerns. Keeping them in a future infrastructure package would couple the
UI to infrastructure. A layer was needed that the UI could depend on without
knowing anything about concrete implementations.

Forces:

- The UI and API layers must depend on stable contracts, not
  implementations.
- Repository and service contracts must be co-located but separate from
  domain entities.
- The application layer must be testable by substituting mock implementations
  against the same contracts.
- The layer must be framework-agnostic — no Express, no React, no Supabase
  types.

## Decision

Create a dedicated `@livingsites/application` package containing **only**
repository contracts and service contracts — interfaces, no implementation.
It depends on `@livingsites/domain` for entity types. No implementation, no
I/O, no framework bindings.

Structure: `src/repositories/` (one file per context) and `src/services/` (one
file per context, plus `cross-context.ts` for `BuilderService` and
`RenderingService`).

Dependency direction: `UI/API → application → domain`. Application depends on
domain; UI depends on application; nothing depends outward from domain.

## Consequences

- **Positive:** The UI depends on service contracts only — it is decoupled
  from persistence and providers. Repository contracts are backend-agnostic;
  Supabase is the first implementation, replaceable without touching services
  or UI. Services are testable by wiring mocks against the same contracts.
- **Negative:** A second package adds build-order complexity (domain must
  build before application). The `workspace:*` protocol issue persists (npm
  uses `"0.0.0"` internal deps). Cross-context services
  (`BuilderService`, `RenderingService`) don't fit neatly into one context
  and live in a `cross-context.ts` file.
- **Neutral:** The application package is contract-only; it is small in
  runtime weight but central to the architecture. Every service consumer
  imports from here.

## Alternatives Considered

- **Contracts in domain.** Keep repository and service contracts in the
  domain package. Rejected (per ADR 001) because it mixes application
  concerns with the pure business model.
- **Contracts in infrastructure.** Put contracts in the future infrastructure
  package. Rejected because the UI would then depend on infrastructure,
  breaking the dependency direction and making the UI non-portable.
- **Contracts in composition.** Put contracts in the composition root.
  Rejected because the composition root is for *wiring*, not for *defining*
  contracts — co-locating them would make the composition package a
  dependency of the UI, which violates the rule that the UI never imports
  composition.
