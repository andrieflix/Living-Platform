# Database Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `DatabaseAdapter` represents the capability to query, transaction, and
migrate a relational database. It is the lowest-level data access port —
repository adapter implementations use it to execute queries, wrap operations
in transactions, and run schema migrations.

No specific database is named. A future Supabase adapter, a Postgres-direct
adapter, or a PGlite adapter would all implement this contract.

## Planned contracts

- **`DatabaseAdapter`** — query execution, transaction management, migration.
- **`DatabaseTransaction`** — a transaction scope with query and commit/rollback.
- **`DatabaseQueryResult`** — a typed query result with rows and metadata.
- **`MigrationRunner`** — runs schema migrations in order, tracks applied versions.

## Principles

1. **The adapter is provider-agnostic.** It uses generic query shapes (SQL
   strings with parameters), not provider-specific SDK calls.
2. **Transactions are explicit.** The caller opens a transaction, executes
   queries within it, and commits or rolls back. No implicit transactions.
3. **Migrations are idempotent.** The migration runner tracks applied
   versions and skips already-applied migrations.
4. **The adapter uses platform runtime capabilities.** A database adapter
   implementation uses `Logger` for query logging and `Clock` for timestamps.
