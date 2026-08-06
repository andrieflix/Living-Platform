# Platform (System) Use Cases

> **Status:** Architecture only. No implementation.

## Commands

- `CreatePlan` — Define a new subscription plan.
- `UpdatePlan` — Change plan limits or pricing.
- `ArchivePlan` — Retire a plan (existing orgs keep it; no new signups).
- `CreateFeature` — Define a new feature flag key.
- `UpdateFeature` — Change feature availability or rules.
- `RegisterSectionType` — Register a platform-global SectionType.
- `UnregisterSectionType` — Retire a SectionType (existing sections render fallback).
- `CreateSystemTheme` — Register a platform-global theme.
- `UpdateSystemTheme` — Update a system theme.

## Queries

- `ListPlans`, `GetPlan` (public), `ListFeatures`, `ListSectionTypes`,
  `ListSystemThemes`, `GetPlatformHealth`.

## Long-running Operations

None.

## Background Jobs

- `PlatformHealthCheck` — Evaluate all registered health checks.

## Events Produced

`PlanCreated`, `PlanUpdated`, `PlanArchived`, `FeatureCreated`,
`FeatureUpdated`, `SectionTypeRegistered`, `SectionTypeUnregistered`,
`SystemThemeCreated`, `SystemThemeUpdated`.

## Events Consumed

None. Platform is a root context.

## External Dependencies

Database provider, health registry.

## Authorization

Platform admin only for all mutations. Public/authenticated users can read
catalogs (plans, section types, themes).

## Future Extension Points

Plan trials, feature gating rules, SectionType versioning, theme inheritance.

See `docs/use-cases.md` §12 for the full catalog.
