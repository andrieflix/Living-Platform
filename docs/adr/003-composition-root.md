# ADR 003 — Composition Root

> **Status:** Accepted

## Context

With domain (ADR 001) and application (ADR 002) layers isolated as
contract-only packages, the platform needs a single place where contracts are
bound to concrete implementations. Without this, implementation wiring would
scatter across the codebase — each UI component or API route would need to
know which repository implementation to use, leaking infrastructure details
(database client, connection strings, SDK configuration) into the UI and
making provider swaps require changes throughout the system.

Forces:

- Concrete implementations must be known in exactly one place.
- Provider swaps (Supabase → another DB, Resend → SES) must be single-file
  changes.
- Credentials and connection details must not leak into UI or application
  code.
- The wiring must be explicit and auditable, not hidden behind a framework.
- Tests must be able to substitute mocks against the same contracts.

## Decision

Create a dedicated `@livingsites/composition` package as the **single
composition root**. It is the only package that imports concrete
implementations (from a future `@livingsites/infrastructure`) and wires them
into the object graph. No code outside this package may construct
repositories, services, or infrastructure providers directly.

Wiring is manual and explicit — a boot function creates providers →
repositories → factories → services in order and returns a wired container.
No DI framework; the object graph is simple enough that explicit `new` calls
are clearer than framework configuration.

Document three registries (services, repositories, providers), a factory
strategy, and a dependency-resolution document with Mermaid diagrams. No
implementation in this milestone — documentation and export placeholders only.

## Consequences

- **Positive:** Provider swaps are single-package changes. Credentials are
  isolated to the composition root and infrastructure. The object graph is
  explicit, auditable, and debuggable. A lint rule can mechanically enforce
  that no file outside `packages/composition/` imports from
  `@livingsites/infrastructure`. Tests assemble parallel mock graphs against
  the same contracts.
- **Negative:** Manual wiring scales with the codebase — the boot function
  will grow long (~25 repositories, ~12 services, ~7 factories). Build order
  is now multi-deep (domain → application → composition). The `workspace:*`
  protocol issue persists.
- **Neutral:** The composition package is the " widest" dependency — it
  imports from application, domain, platform, and (future) infrastructure.
  It is imported only by the application entry point.

## Alternatives Considered

- **DI framework (e.g. Inversify, tsyringe).** Use a framework to wire
  dependencies via decorators and a container. Rejected because the object
  graph is linear and simple — a framework adds indirection, configuration
  files, and runtime reflection without proportional value. Explicit `new`
  calls are more auditable and debuggable.
- **Wiring in the UI entry point.** Wire dependencies in the app's main
  entry file. Rejected because it scatters infrastructure knowledge into the
  UI layer and makes it hard to enforce the boundary with a lint rule.
- **Service locator pattern.** Use a global registry that services query at
  runtime for their dependencies. Rejected because it hides dependencies,
  makes testing harder (mocks must be registered in the global), and breaks
  the "dependencies are constructor parameters" principle.
