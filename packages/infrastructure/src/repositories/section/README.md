# Section Repository Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `SectionRepositoryAdapter` adapts the application-layer
`SectionTypeRepository` and `SectionTypeRegistry` interfaces to
infrastructure providers. It adds infrastructure lifecycle methods via
`DatabaseBackedAdapter`.

Section is a child entity of the Page aggregate and has no independent
repository port. Sections are persisted through the `PageRepositoryAdapter`
as part of the Page aggregate.

## Planned contracts

- **`SectionRepositoryAdapter`** — composes `SectionTypeRepository` and
  `SectionTypeRegistry` as named sub-adapters with `DatabaseBackedAdapter`
  lifecycle methods.

## Principles

1. The adapter implements the application-layer contracts — use cases see no
   difference.
2. Section props are stored as JSON blobs, validated against the SectionType
   schema at the application layer (policies), not at the adapter level.
3. The `SectionTypeRegistry` is backed by a database table plus an in-memory
   cache for fast resolution during rendering.
4. Infrastructure table mappers for sections are private implementation
   details of the `PageRepositoryAdapter` — they are not exposed as
   application-layer ports.
