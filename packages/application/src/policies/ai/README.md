# Future AI Policies

> **Status:** Architecture only. No implementation. No AI features exist yet.

## Purpose

Reserved for future AI-assisted features. Documented here to establish the
architectural seam.

## Policies

| Policy | Severity | Summary |
|---|---|---|
| `AIUsageQuotaPolicy` | hard | Deny if org exceeded AI request quota. |
| `AIContentPolicy` | mixed | Warn or deny if content matches prohibited patterns. |
| `AIModelAccessPolicy` | hard | Deny if plan doesn't include the requested model tier. |
| `AIRateLimitPolicy` | hard | Deny if org exceeds AI request rate limit. |
| `AIOutputValidationPolicy` | hard | Deny if AI-generated props fail schema validation. |
| `AISafetyPolicy` | hard | Deny if prompt or output violates safety guidelines. |

## Inputs

`orgId`, `plan`, `generatedContent`, `modelTier`, `prompt`.

## Evaluation

Mixed synchronous (quota, rate limit) and potentially asynchronous (content
moderation, safety screening). The architecture supports both: the use case
calls any external screening first, then passes results to the policy as
inputs.

## Future Extension Points

AI attribution policy, AI training opt-out policy, AI model fallback policy.

See `docs/policies.md` §12 for the full catalog.
