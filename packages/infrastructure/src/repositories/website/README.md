# Website Repository Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `WebsiteRepositoryAdapter` adapts the application-layer
`WebsiteRepository` interface to infrastructure providers. It adds
infrastructure lifecycle methods (initialize, health check, close) via
`DatabaseBackedAdapter`.

WebsiteSettings is a child entity of the Website aggregate and has no
independent repository port. Settings are persisted atomically with the
Website root through the `WebsiteRepository`.

## Planned contracts

- **`WebsiteRepositoryAdapter`** — composes `WebsiteRepository` as a named
  sub-adapter with `DatabaseBackedAdapter` lifecycle methods.

## Principles

1. The adapter implements the application-layer contract — use cases see no
   difference.
2. The adapter uses `DatabaseAdapter` for data access and `Logger` for
   operation logging.
3. WebsiteSettings rows are managed within the Website transaction by the
   adapter. The table mapper for settings is a private implementation detail
   — it is not exposed as an application-layer port.
