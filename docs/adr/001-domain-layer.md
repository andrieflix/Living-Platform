# ADR 001 — Domain Layer

> **Status:** Accepted

## Context

The Living Sites platform needs a stable, portable domain model that
describes the business entities (Organization, Website, Page, Section, Media,
Form, etc.) and their relationships. This model must survive changes in
persistence providers, UI frameworks, and API layers without rewriting. Early
drafts mixed entity types with repository and service contracts in a single
package, which created coupling between the business model and application
concerns — making the model harder to reason about and impossible to swap
persistence without touching entity definitions.

Forces:

- The domain must be the most stable layer; it changes least.
- The domain must be portable across persistence and UI technologies.
- Multiple bounded contexts (organization, website, page, section, media, seo,
  analytics, forms, export, navigation, theme) need clear ownership of
  entities without cross-contamination.
- Future extensibility (plugins, events, versioning) must have stable seams.

## Decision

Create a dedicated `@livingsites/domain` package that contains **only**
entities, value objects, enums, and types. No service contracts, no repository
contracts, no I/O, no framework imports, no dependencies on any other package.

Organize the package into bounded contexts, each a folder under
`packages/domain/src/<context>/` with `types.ts`, `enums.ts`, and `index.ts`.
Reserve four future contexts (`builder`, `rendering`, `plugin`, `events`) with
contracts and documentation only.

Domain depends on nothing. All other packages may depend on domain.

## Consequences

- **Positive:** The domain model is portable — swapping Supabase for another
  provider or adding a new UI framework requires zero changes to domain. The
  model is pure and easy to reason about. Bounded contexts give each area
  clear ownership. Reserved contexts create stable seams for plugins, events,
  versioning, and the builder/rendering pipeline.
- **Negative:** A separate package adds build complexity (domain must build
  before dependents). The `workspace:*` protocol isn't supported by npm,
  requiring version-string internal deps. Reserved contexts define contracts
  that may evolve before implementation.
- **Neutral:** The domain package is large (18 contexts) but each context is
  small and cohesive. Consumers import from the root barrel or per-context
  entry points.

## Alternatives Considered

- **Single package with folders.** Keep domain and application in one package,
  separated by folder. Rejected because folder boundaries are not
  mechanically enforceable — a lint rule cannot easily prevent
  `domain/organization` from importing `application/repositories`.
- **Domain + contracts in one package.** Keep repository and service
  contracts in the domain package (the pre-refactor state). Rejected because
  it mixes application concerns (persistence orchestration contracts) with
  pure business model, making the model harder to reason about and coupling
  it to data-access concepts.
- **Per-context packages.** One package per bounded context
  (`@livingsites/domain-organization`, etc.). Rejected as excessive — 18+
  packages for a single layer adds maintenance overhead without meaningful
  isolation, since contexts share value objects and enums.
