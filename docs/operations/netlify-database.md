# Netlify Database

## Overview

Netlify Database is the authoritative production database provider for
Living Sites. It provides managed Postgres with automatic branching for
deploy previews, seamless local development, and native Drizzle ORM
integration.

## Provisioning

Install `@netlify/database` in the project. When the project is deployed
to Netlify, the database is automatically provisioned. No manual
connection string configuration is required in the Netlify runtime.

```bash
npm install @netlify/database
```

## @netlify/database Usage

The `@netlify/database` module provides:

- `getConnectionString()` — returns the Postgres connection URL for the
  current environment (production or deploy preview branch).
- `getDatabase()` — returns a `DatabaseConnection` with a `pg.Pool`
  for server-side usage.

In the Netlify runtime, the connection is resolved automatically.
For local development, `netlify dev` provides a local Postgres-compatible
database.

## Native Drizzle Adapter

Use `drizzle-orm/netlify-db` for the native Netlify Database adapter:

```typescript
import { drizzle } from "drizzle-orm/netlify-db";
import * as schema from "./schema";

const db = drizzle({ client: connection.pool, schema });
```

This adapter is used inside the `NetlifyDatabaseProvider` in
`packages/infrastructure/src/providers/netlify-database/`. Application
and Domain layers never import `@netlify/database` or
`drizzle-orm/netlify-db`.

## Authoritative Migration Directory

All migrations are in:

```
netlify/database/migrations/
  0001_create_organizations.sql
  0002_create_plans_features_entitlements.sql
  0003_create_application_outbox.sql
  meta/
    _journal.json
```

This is the single authoritative migration history. There are no
duplicate migration sets.

## Automatic Deploy Migrations

Netlify automatically applies migrations from `netlify/database/migrations/`
during deploy previews and production deploys. Each deploy preview gets
an isolated database branch with migrations applied.

## Local Database Startup

```bash
netlify dev
```

This starts a local Postgres-compatible database. The `@netlify/database`
module resolves the connection automatically.

## Local Migration Application

```bash
netlify database migrations apply
```

## Local Reset

```bash
netlify database reset
```

## Database Status Inspection

```bash
netlify database status
```

Shows which migrations are pending, applied, and what command to run next.

## Integration-Test Workflow

Integration tests use `@netlify/database-dev` to start a real local
Postgres-compatible database:

```bash
npm run test:db
```

The test harness:
1. Starts a local Postgres-compatible database via `@netlify/database-dev`
2. Applies migrations from `netlify/database/migrations/`
3. Runs the integration test suite
4. Tears down the database

No manual database provisioning is required.

## Deploy-Preview Database Branches

When a pull request is opened, Netlify automatically:
1. Creates a deploy preview
2. Provisions an isolated database branch
3. Applies all current migrations

## Rollback Strategy

Rollback is handled through migration/repository revert strategy:
- Create a new forward-only migration that reverses the change
- Never rewrite or delete an already-deployed migration
- The migration history is append-only

## Versions

| Package | Version |
|---------|---------|
| `@netlify/database` | 1.1.0 |
| `@netlify/database-dev` | 0.10.1 |
| `@netlify/functions` | 5.3.0 |
| `drizzle-orm` | 1.0.0-beta.22 |
| `drizzle-kit` | 1.0.0-beta.22 |
