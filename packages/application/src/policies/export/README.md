# Export Policies

> **Status:** Architecture only. No implementation.

## Purpose

Govern export job creation, format constraints, and resource limits.

## Policies

| Policy | Severity | Summary |
|---|---|---|
| `ExportFormatPolicy` | hard | Deny if format not supported by plan. |
| `ExportScopePolicy` | hard | Deny if scope is invalid for website state. |
| `ConcurrentExportPolicy` | hard | Deny if org has maxConcurrentExports running. (Shared.) |
| `ExportSizePolicy` | soft | Warn if estimated export size exceeds threshold. |
| `ExportRetentionPolicy` | decision | Return purge decision based on retention. |

## Inputs

`format`, `scope`, `websiteId`, `orgId`, `plan`.

## Evaluation

Synchronous. `ExportSizePolicy` produces a warning. `ExportRetentionPolicy`
returns a lifecycle decision.

See `docs/policies.md` §7 for the full catalog.
