# Organization Policies

> **Status:** Architecture only. No implementation.

## Purpose

Govern org lifecycle, membership, and plan changes.

## Policies

| Policy | Severity | Summary |
|---|---|---|
| `SoleOwnerPolicy` | hard | Deny removing or downgrading the last owner. |
| `RoleHierarchyPolicy` | hard | Deny if a non-owner assigns a role >= their own. |
| `InvitationExpiryPolicy` | hard | Deny acceptance if invitation has expired. |
| `PlanDowngradePolicy` | soft | Warn if new plan limits are below current usage. |
| `ArchiveImpactPolicy` | soft | Warn if archiving will cascade-archive N websites. |
| `SelfRemovalPolicy` | hard | Deny if user is the sole owner (specialized). |

## Inputs

`orgId`, `userId`, `members` (with roles), `currentPlan`, `newPlan`, `websites`.

## Evaluation

Synchronous, deterministic. Operates on member lists and plan data passed as
inputs by the use case.

See `docs/policies.md` §9 for the full catalog.
