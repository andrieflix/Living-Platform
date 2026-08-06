# Vertical Slice: Create Organization

> Architecture Version 1.0.0 — Approved and Frozen
> Production foundation: Sprint 10 + corrective milestone (Netlify Database)

## Capability Purpose

Create a new Organization aggregate — the top-level tenant entity.

## Production Database Provider

Netlify Database is the authoritative production database provider.
The production composition (`composeProduction`) uses the
`NetlifyDatabaseProvider` which creates a Drizzle client via
`drizzle-orm/netlify-db`. No manually copied connection string is
required in the Netlify runtime.

For generic PostgreSQL development, use `composePostgresDevelopment`.

## Transactional Outbox

Organization creation persists the aggregate and the
`OrganizationCreated` outbox record atomically in a single database
transaction. See [ADR 008](../adr/008-transactional-outbox.md).

## Composition API

### composeProduction (Netlify Database)

- Uses `@netlify/database` automatically
- Fails fast with `MissingNetlifyDatabaseError` when unavailable
- No in-memory dependencies, no test-support imports
- Exposes `healthCheck()` and `close()`

### composePostgresDevelopment (generic PostgreSQL)

- Accepts explicit `databaseUrl`
- Clearly named as development — NOT for production

### composeDevelopment (in-memory)

- In-memory adapters for local development
- Uses `NoopEventPublisher` (explicitly selected)

### composeTest (deterministic)

- Deterministic test-support adapters
- `InMemoryEventPublisher` for event capture

## Migration Directory

Authoritative migrations in `netlify/database/migrations/`:

```
0001_create_organizations.sql
0002_create_plans_features_entitlements.sql
0003_create_application_outbox.sql
```

## Seed Reconciliation

Seeds use controlled upsert. See [Seeding](../operations/seeding.md).

## Outbox Scheduled Function

The outbox processor runs as a Netlify Scheduled Function every 5
minutes. See [Outbox Operations](../operations/outbox.md).

## RLS Decision

RLS is deferred to the Authentication/Tenant Engine milestone. See
[ADR 009](../adr/009-rls-deferred.md).

## Commands

```bash
# Build
npm run build

# Typecheck
npm run typecheck

# Lint
npm run lint

# Unit tests
npm run test:unit

# Database integration tests (uses @netlify/database-dev)
npm run test:db

# All tests
npm run test:all

# Generate migrations
npm run db:generate

# Apply migrations (local)
netlify database migrations apply

# Seed
npm run db:seed

# Outbox worker (CLI)
npm run outbox:process

# Database status
netlify database status
```
