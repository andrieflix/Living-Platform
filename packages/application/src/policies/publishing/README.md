# Publishing Policies

> **Status:** Architecture only. No implementation.

## Purpose

Govern the transition from draft to published state — the quality gate for
public content.

## Policies

| Policy | Severity | Summary |
|---|---|---|
| `PageHasContentPolicy` | hard | Deny if the page has zero sections. |
| `SectionValidationPolicy` | hard | Deny if section props fail schema validation. |
| `SlugUniquenessPolicy` | hard | Deny if another page uses the same slug. |
| `HomepageRequiredPolicy` | soft | Warn if the website has no homepage. |
| `ScheduledPublishConflictPolicy` | hard | Deny if the page already has a scheduled publish. |
| `OrphanedSectionPolicy` | soft | Warn if a section references an unregistered SectionType. |
| `PublishCooldownPolicy` | soft | Warn if the page was published less than N seconds ago. |
| `SnapshotIntegrityPolicy` | hard | Deny if the snapshot would be empty or corrupted. |

## Inputs

`pageId`, `websiteId`, `sections`, `sectionTypes` (registry), `lastPublishedAt`.

## Evaluation

Synchronous, deterministic. `SectionValidationPolicy` validates each section's
props against the SectionType schema. The schema validation function is
injected by the use case — the policy itself does not access the SectionType
registry.

See `docs/policies.md` §3 for the full catalog.
