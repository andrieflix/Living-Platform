# Page Repository Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `PageRepositoryAdapter` adapts the application-layer `PageRepository` and
`PageSnapshotRepository` interfaces to infrastructure providers. It adds
infrastructure lifecycle methods via `DatabaseBackedAdapter`.

`PageRepository` owns the Page aggregate root, including its Section child
entities. Sections have no public repository port — they are persisted
atomically with the Page through the `PageRepository`. The adapter may use
an internal table mapper for sections, but that mapper is a private
implementation detail, not an application-layer port.

## Planned contracts

- **`PageRepositoryAdapter`** — composes `PageRepository` and
  `PageSnapshotRepository` as named sub-adapters with `DatabaseBackedAdapter`
  lifecycle methods.

## Principles

1. The adapter implements the application-layer contracts — use cases see no
   difference.
2. Snapshot persistence uses the same database adapter, storing snapshots as
   immutable JSON blobs with version tracking.
3. The adapter uses `DatabaseAdapter` for data access, `Logger` for operation
   logging, and `Clock` for snapshot timestamps.
4. Internal table mappers for sections are private to the adapter — they are
   not exposed as application-layer ports.
