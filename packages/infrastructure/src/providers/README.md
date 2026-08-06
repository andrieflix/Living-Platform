# Provider Registration

> **Status:** Documentation only. No implementation in this milestone.

## Purpose

The providers module is the future home for provider registration contracts —
the mechanism by which the composition root records which concrete adapter
implementation is active for each adapter contract.

This milestone defines only the folder structure and documentation. No
provider registration interfaces are defined yet.

## How it will work

At application boot, the composition root will:

1. Read configuration (environment variables, secrets via `SecretRef`).
2. Instantiate concrete adapter implementations (e.g. Supabase database
   adapter, Supabase storage adapter, Resend email adapter).
3. Register each adapter in the provider registry.
4. Hand adapters to repository adapter implementations.
5. Repository adapters are bound to application-layer repository ports.

## Future adapter-to-provider mapping

| Adapter Contract | Future Provider | Consumers |
|---|---|---|
| `DatabaseAdapter` | Supabase Postgres | All repository adapters |
| `StorageAdapter` | Supabase Storage | MediaRepositoryAdapter |
| `SearchAdapter` | Postgres FTS / Meilisearch | Media, Pages (optional) |
| `EmailAdapter` | Resend / SES | Form notifications, invitations |
| `CacheAdapter` | Redis / in-memory | Query caching (optional) |
| `QueueAdapter` | Supabase Queues / Redis | Export, media processing, scheduled publish |
| `TelemetryAdapter` | OpenTelemetry / Datadog | Platform telemetry sink |
| `LoggingAdapter` | Console JSON / Logtail | Platform logger factory |

## Why providers are invisible to the application

Providers deal with connection strings, SDK configuration, and external
system credentials. The application layer defines ports (repository
interfaces); the infrastructure layer defines adapters (provider
capabilities); the composition root wires a concrete provider to each
adapter. Nothing above the composition root knows which provider is in use.
