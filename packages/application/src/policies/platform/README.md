# Platform Policies

> **Status:** Architecture only. No implementation.

## Purpose

Govern system-wide constraints: section type registration, theme management,
and plan administration.

## Policies

| Policy | Severity | Summary |
|---|---|---|
| `SectionTypeUninstallPolicy` | soft | Warn if unregistering will orphan sections in N websites. |
| `SectionTypeVersionPolicy` | hard | Deny if new schema is not backward-compatible. |
| `PlanArchivePolicy` | soft | Warn if archiving a plan affects N orgs. |
| `ThemeDependencyPolicy` | hard | Deny if theme requires an unregistered SectionType. |
| `PlatformMaintenancePolicy` | hard | Deny if platform is in maintenance and operation is not exempt. |

## Inputs

`sectionTypeId`, `planId`, `themeId`, `websites`, `orgs`, `sectionTypes`,
`maintenanceWindow`.

## Evaluation

Synchronous. Evaluated by platform-admin use cases before system-wide changes.

See `docs/policies.md` §10 for the full catalog.
