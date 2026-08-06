# Repository Registry

> **Status:** Documentation only. No implementation in this milestone.

## Purpose

The repository registry is the future mechanism by which the composition root
records which concrete implementation satisfies each repository contract.
Like the service registry, it is used exclusively at application startup to
build the object graph — never at runtime by services.

## How it will work

At application boot, the composition root will:

1. Create infrastructure providers (see `providers.md`).
2. Create repository implementations, injecting the providers they need.
3. Register each repository in the repository registry under its contract type.
4. Inject repositories into service implementations.

Services receive repositories as constructor parameters. They never consult the
registry themselves. The registry exists so the composition root can
centralize wiring and so tests can substitute implementations.

## Registered repositories (future)

| Contract | Provider dependency | Lifetime |
|---|---|---|
| `OrganizationRepository` | Database client | Singleton |
| `PlanRepository` | Database client | Singleton |
| `FeatureRepository` | Database client | Singleton |
| `UserRepository` | Database client | Singleton |
| `MembershipRepository` | Database client | Singleton |
| `RoleRepository` | Database client | Singleton |
| `WebsiteRepository` (owns WebsiteSettings) | Database client | Singleton |
| `NavigationRepository` (owns MenuItems) | Database client | Singleton |
| `ThemeRepository` | Database client | Singleton |
| `PageRepository` (owns Sections) | Database client | Singleton |
| `PageSnapshotRepository` | Database client | Singleton |
| `SectionTypeRepository` | Database client | Singleton |
| `SectionTypeRegistry` | Database client | Singleton |
| `MediaRepository` | Storage client + database client | Singleton |
| `FolderRepository` | Database client | Singleton |
| `SEOProfileRepository` | Database client | Singleton |
| `SchemaProfileRepository` | Database client | Singleton |
| `RobotsPolicyRepository` | Database client | Singleton |
| `AnalyticsProfileRepository` | Database client | Singleton |
| `AnalyticsMetricsStore` | Analytics provider SDK | Singleton |
| `FormRepository` (owns FormFields) | Database client | Singleton |
| `SubmissionRepository` | Database client | Singleton |
| `ExportJobRepository` | Database client | Singleton |

All repositories are **singleton** lifetime. They are stateless adapters over
infrastructure clients; there is no benefit to creating multiple instances.

Aggregate children (Section, FormField, MenuItem, WebsiteSettings) do not
have registered repositories — they are persisted through their aggregate
root's repository. Infrastructure table mappers for children are private
implementation details of the adapter.

## What the registry is NOT

- **Not accessed by services.** Services receive repositories via constructor
  injection at composition time.
- **Not accessed by the UI.** The UI never sees repositories.
- **Not a runtime lookup table.** It is a wiring-time construct only.
