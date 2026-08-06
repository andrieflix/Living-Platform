# Builder Policies

> **Status:** Architecture only. No implementation.

## Purpose

Govern builder session constraints, concurrency, and edit safety.

## Policies

| Policy | Severity | Summary |
|---|---|---|
| `SessionConcurrencyPolicy` | hard | Deny if active sessions exceed plan max editors. |
| `SessionOwnershipPolicy` | hard | Deny if user does not own the session. |
| `PageEditablePolicy` | hard | Deny if page is archived or being published. |
| `BatchSizePolicy` | hard | Deny if batch exceeds max sections per batch. |
| `ConflictDetectionPolicy` | soft | Warn if another session committed conflicting changes. |
| `BuilderEntitlementPolicy` | hard | Deny if builder feature flag is off or plan doesn't entitle. |

## Inputs

`pageId`, `sessionId`, `userId`, `activeSessions`, `pageStatus`, `plan`,
`featureFlags`.

## Evaluation

Synchronous. `ConflictDetectionPolicy` compares the session's base state
against committed changes from other sessions. The comparison logic is
injected by the use case.

See `docs/policies.md` §8 for the full catalog.
