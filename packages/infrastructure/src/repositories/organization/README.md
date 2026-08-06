# Organization Repository Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `OrganizationRepositoryAdapter` adapts the application-layer
`OrganizationRepository` interface to infrastructure providers. It adds
infrastructure-level concerns — adapter initialization, connection lifecycle,
and health checks — that the application contract does not include.

A future Supabase implementation will use `DatabaseAdapter` to fulfill the
`OrganizationRepository` contract, translating domain entities to and from
database rows.

## Planned contracts

- **`OrganizationRepositoryAdapter`** — extends `OrganizationRepository` with
  `DatabaseBackedAdapter` lifecycle methods.
- **`DatabaseBackedAdapter`** — common lifecycle for all database-backed
  repository adapters: initialize, health check, close.

## Principles

1. The adapter implements the application-layer `OrganizationRepository`
   contract — use cases see no difference.
2. The adapter adds infrastructure lifecycle methods that the composition root
   calls during startup and shutdown.
3. The adapter uses `DatabaseAdapter` for data access, `Logger` for operation
   logging, and `Clock` for audit timestamps.
