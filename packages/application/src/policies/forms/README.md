# Forms Policies

> **Status:** Architecture only. No implementation.

## Purpose

Govern form creation, submission validation, and spam prevention.

## Policies

| Policy | Severity | Summary |
|---|---|---|
| `FormFieldsPolicy` | hard | Deny if fields exceed plan.maxFieldsPerForm. |
| `SubmissionSizePolicy` | hard | Deny if payload exceeds plan.maxSubmissionSizeBytes. |
| `FormActivePolicy` | hard | Deny if form is not active or website archived. |
| `SpamScorePolicy` | hard | Deny if spam score exceeds plan.spamScoreThreshold. |
| `RateLimitPolicy` | hard | Deny if IP exceeded max submissions per window. |
| `RequiredFieldsPolicy` | hard | Deny if required fields are missing. |
| `HoneypotPolicy` | hard | Deny if honeypot field is filled (bot). |

## Inputs

`formId`, `fields`, `submission`, `ipAddress`, `plan`, `spamScore` (from
external screening, injected by use case).

## Evaluation

Synchronous. `SpamScorePolicy` receives the spam score as input — the use case
calls the spam service first, then passes the result to the policy.

See `docs/policies.md` §11 for the full catalog.
