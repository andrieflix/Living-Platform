# Subscription Policies

> **Status:** Architecture only. No implementation.

## Purpose

Enforce plan limits and entitlements — the primary commercial guardrails.

## Policies

| Policy | Severity | Summary |
|---|---|---|
| `WebsiteCountPolicy` | hard | Deny if website count >= plan.maxWebsites. |
| `PageCountPolicy` | hard | Deny if page count >= plan.maxPagesPerWebsite. |
| `StorageQuotaPolicy` | hard | Deny if storage + bytesToAdd >= plan.maxStorageBytes. |
| `MediaCountPolicy` | hard | Deny if media count >= plan.maxMediaItems. |
| `FormCountPolicy` | hard | Deny if form count >= plan.maxForms. |
| `SubmissionCountPolicy` | hard | Deny if submission count >= plan.maxSubmissionsPerForm. |
| `ExportCountPolicy` | hard | Deny if active exports >= plan.maxConcurrentExports. |
| `MemberCountPolicy` | hard | Deny if member count >= plan.maxMembers. |
| `PluginCountPolicy` | hard | Deny if installed plugins >= plan.maxPlugins. |
| `CustomDomainPolicy` | hard | Deny if custom domains >= plan.maxCustomDomains. |
| `FeatureEntitlementPolicy` | hard | Deny if plan does not include the requested feature. |
| `PlanActivePolicy` | hard | Deny if the org's plan is archived or suspended. |

## Inputs

`orgId`, `plan` (PlanSummary), usage counts, `bytesToAdd` (for storage).

## Evaluation

Synchronous, deterministic. Compares current count against plan limit. No
external calls, no side effects.

## Failure

Returns a `PolicyDecision` with `outcome: "deny"`, current value, and limit.
The use case maps it to a `DomainError`. The UI renders an upgrade prompt.

## Future Extension Points

Overage policies (usage-based billing), grace period policies, custom plan
policies.

See `docs/policies.md` §1 for the full catalog.
