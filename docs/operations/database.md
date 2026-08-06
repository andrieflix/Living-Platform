# Database Operations

## Production Provider

Netlify Database is the authoritative production database provider.
See [Netlify Database](./netlify-database.md) for provisioning and
configuration details.

## Production Dependency Graph

```
composeProduction (Netlify Database)
  ├── SystemClock
  ├── CryptoIdGenerator
  ├── ConsoleLogger
  ├── NetlifyDatabaseProvider (drizzle-orm/netlify-db)
  │     ├── DrizzleOrganizationRepository
  │     ├── DrizzlePlanReader
  │     ├── DrizzleFeatureReader
  │     ├── OutboxEventPublisher
  │     ├── DrizzleOrganizationCreationPersistence
  │     └── DrizzleOutboxProcessor
  └── CreateOrganization use case
```

For generic PostgreSQL development (non-Netlify), use
`composePostgresDevelopment` which accepts an explicit connection string.
This is clearly named as development — NOT for production.

## Plan and Feature Persistence

Plans and Features are platform-global reference data stored in:
- `plans` — subscription tiers
- `features` — discrete capabilities
- `plan_feature_entitlements` — plan-feature associations

Read-only adapters (`DrizzlePlanReader`, `DrizzleFeatureReader`) map
database rows to domain contracts. Provider-specific row types stay
inside Infrastructure.

## Migration vs Seeding

**Migrations** define schema. **Seeds** populate reference data.
See [Seeding](./seeding.md) for seed reconciliation details.

## Operational Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Drizzle migrations from schema |
| `npm run db:migrate` | Apply migrations (local) |
| `npm run db:check` | Check schema drift |
| `npm run db:seed` | Seed plans and features |
| `npm run outbox:process` | Run outbox processor (CLI) |

Netlify CLI commands:
| Command | Description |
|---------|-------------|
| `netlify database migrations apply` | Apply migrations to local DB |
| `netlify database status` | Inspect migration state |
| `netlify database reset` | Reset local database |

## RLS Decision

RLS is deferred to the Authentication/Tenant Engine milestone. See
[ADR 009](../adr/009-rls-deferred.md). The server-side database role has
full access. No Supabase auth assumptions remain.

## Integration Tests

Integration tests run against a real local Postgres-compatible database
via `@netlify/database-dev`:

```bash
npm run test:db      # database integration tests only
npm run test:unit    # unit tests only
npm run test:all     # all tests
```
