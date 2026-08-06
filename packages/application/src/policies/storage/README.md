# Storage Policies

> **Status:** Architecture only. No implementation.

## Purpose

Govern the storage layer abstraction — bucket access, presigned URL TTLs, and
object lifecycle.

## Policies

| Policy | Severity | Summary |
|---|---|---|
| `BucketAccessPolicy` | hard | Deny if the org does not own the bucket path. |
| `PresignedUrlTtlPolicy` | hard | Deny if TTL exceeds plan max. |
| `ObjectLifecyclePolicy` | decision | Return keep/purge/transition based on retention and plan. |
| `StorageTierPolicy` | decision | Return hot/warm/cold tier based on access frequency and plan. |

## Inputs

`orgId`, `mediaId`, `bucketPath`, `ttl`, `plan`.

## Evaluation

Synchronous. `ObjectLifecyclePolicy` and `StorageTierPolicy` return decisions
(keep/purge/transition, hot/warm/cold) rather than allow/deny — they guide
background jobs rather than blocking user operations.

See `docs/policies.md` §6 for the full catalog.
