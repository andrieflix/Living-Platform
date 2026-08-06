# ADR 006 — Business Policy Engine

> **Status:** Accepted

## Context

The Living Sites platform has approved domain, application, composition,
platform, and use case layers. Use cases contain business orchestration —
they coordinate authorization, repository reads, validation, repository
writes, and event emission. But use cases alone are not sufficient for
business rules.

Consider `PublishPage`: before publishing, the use case must check that the
page has content, that all sections validate against their schemas, that the
slug is unique, that no other page is scheduled for the same time, and that
the page was not published too recently. Consider `UploadMedia`: before
storing, the use case must check the file type, file size, image dimensions,
storage quota, and dangerous file extensions. Consider `CreateWebsite`: the
use case must check that the org hasn't exceeded its website limit and that
the org's plan is active.

Without a policy architecture, these rules embed directly inside use case
methods. The same rule (e.g. storage quota) is duplicated across `UploadMedia`,
`CreatePage`, and `AddSection`. A rule change requires finding every
embedded copy. Testing requires full use case integration rather than a
focused unit. Business rules become invisible — there is no catalog, no name,
no reusable unit.

Forces:

- Business rules must be **explicit and named** — a developer should be able
  to find "the rule that prevents publishing empty pages" by name.
- Business rules must be **reusable** — `StorageQuotaPolicy` is used by
  multiple use cases without duplication.
- Business rules must be **testable in isolation** — a policy is a pure
  function with inputs and a decision, testable without repositories or
  infrastructure.
- Business rules must be **independent of authorization** — authorization
  answers "who can act?"; policies answer "does business state allow this?"
  Conflating them leads to authorization logic leaking into business rules
  and vice versa.
- Business rules must be **independent of feature flags** — a feature flag
  is a rollout toggle; a policy is a business constraint. A flag may be an
  input to a policy, but a flag is not a policy.
- Business rules must **scale** — the platform has 78 policies across 12
  categories. Embedding them in use cases would make use cases unreadable and
  rules untraceable.

## Decision

Adopt a **business policy engine architecture**: business rules are
first-class, reusable, deterministic functions called **policies**. Each
policy has a name, category, severity (hard/soft), and an `evaluate` method
that takes plain-data inputs and returns a `PolicyDecision` (allow, deny,
warn, or decision).

Policies are organized by bounded context in
`packages/application/src/policies/`. A shared contracts module
(`policies/shared/`) defines `Policy`, `PolicyDecision`, `PolicyResult`,
`PolicyChain`, `CompositePolicy`, `PolicyGroup`, and `PolicyContext`.

Rules:

1. **Policies are independent of authorization.** Authorization checks
   identity and membership; policies check business state. Use cases check
   authorization first, then policies.
2. **Policies never access repositories.** The use case fetches data and
   passes it as input. Policies are pure functions of their inputs.
3. **Policies are deterministic.** Same inputs → same decision. The current
   time is an input (`PolicyContext.now`), not a global.
4. **Feature flags are inputs to policies.** A flag value is passed via
   `PolicyContext.featureFlags`. The policy may use it, but the flag is not
   the decision.
5. **Subscription plans influence policies.** A `PlanSummary` is part of
   `PolicyContext`. Plan changes automatically affect policy outcomes.
6. **Policy chains short-circuit on hard denials.** Warnings accumulate but
   do not stop the chain.
7. **Policy overrides are explicit and auditable.** Overrides record what was
   overridden, by whom, and why. Never silent.

The master catalog (`docs/policies.md`) lists every policy across 12
categories with inputs, evaluation, failure behavior, and future extension
points. The policy engine doc (`docs/policy-engine.md`) documents evaluation
flow, chains, composites, groups, failure handling, overrides, and future
composition.

## Consequences

- **Positive:** Business rules are explicit, named, and cataloged — a
  developer can find any rule by name in `docs/policies.md`. Rules are
  reusable — `StorageQuotaPolicy` is defined once and used by every use case
  that touches storage. Rules are testable in isolation — a policy is a pure
  function, testable with plain data, no mocks needed. Rules are independent
  of infrastructure — changing the database or storage provider does not
  affect policies. Plan changes automatically affect policy outcomes because
  the plan is an input. Plugin-contributed policies are architecturally
  supported — a plugin can register a policy into the registry, and use case
  chains can include it dynamically.
- **Negative:** More indirection — a use case evaluates a policy chain rather
  than checking a condition inline. The policy catalog (78 policies) is large
  and must be maintained. Developers must resist the temptation to inline
  "quick" business checks in use cases. The separation of authorization,
  feature flags, and policies means a use case has three pre-mutation steps,
  which is more code than a single embedded check.
- **Neutral:** Policies are not a framework or runtime service — they are
  contracts and conventions. The `Policy` interface is simple enough that
  implementations will be small functions. The policy engine (chains,
  composites, merge strategies) will be implemented in a future milestone;
  this milestone defines the contracts and catalog only.

## Alternatives Considered

- **Embedded business rules in use cases.** Each use case method contains its
  business checks inline. Rejected because rules are duplicated across use
  cases (storage quota is checked in 3+ places), untestable in isolation (a
  use case test requires repositories and infrastructure), and invisible
  (there is no catalog or name for a rule). A rule change requires finding
  every embedded copy.

- **Validation in domain entities.** Entity methods (`page.canPublish()`,
  `media.canUpload()`) encapsulate business rules. Rejected because it
  couples the domain to plan data and feature flags — the domain would need
  to know about subscription plans, which violates the domain's purity (ADR
  001). Also, many rules span multiple entities (storage quota needs org +
  plan + current usage), which doesn't fit on a single entity.

- **Authorization framework as policy engine.** Use an authorization
  framework (e.g. CASL, Oso) to define rules. Rejected because authorization
  frameworks answer "who can act?" (role/permission based), not "does
  business state allow this?" (quota/content/lifecycle based). Conflating
  them leads to authorization logic leaking into business rules. The platform
  needs both, separately.

- **Feature flags as policies.** Use the feature flag system to gate
  operations (if the flag is off, deny). Rejected because feature flags are
  rollout toggles, not business constraints. A flag cannot express "deny if
  page count exceeds plan limit" — it can only express "is this feature on or
  off." Flags are inputs to policies, not policies themselves.

- **Rules engine (e.g. json-rules-engine, drools).** Use an external rules
  engine to define and evaluate business rules. Rejected as premature — the
  platform's rules are deterministic, input-driven, and relatively simple
  (comparisons and validations). A full rules engine adds configuration
  complexity, a learning curve, and a runtime dependency without proportional
  value. The policy contracts (`Policy`, `PolicyChain`, `CompositePolicy`)
  provide the necessary structure with plain TypeScript.

## Why policies exist

Policies exist because business rules are a distinct concern from
authorization, data access, and orchestration. Without a dedicated home,
business rules scatter across use cases, duplicate, and become invisible.
Policies give each rule a name, a home, a test, and a catalog entry. They
make the platform's commercial logic explicit and auditable.

## Why they are separate from authorization

Authorization answers "is this user allowed to act?" — it depends on identity,
membership, and roles. Policies answer "does business state permit this
action?" — they depend on plan limits, content constraints, and lifecycle
rules. Conflating them leads to two failure modes: authorization logic
leaking into business rules (e.g. a quota check that also verifies role), and
business rules leaking into authorization (e.g. a role check that also
verifies page count). Keeping them separate means each can be tested,
evolved, and audited independently.

## Why feature flags are not policies

Feature flags answer "is this capability rolled out?" — they are rollout
toggles controlled by platform admins. Policies answer "does business state
allow this?" — they are business constraints evaluated per operation. A flag
is a boolean; a policy is a function with rich inputs and a structured
decision. A flag cannot express "deny if the page has no sections" or "warn
if the sitemap exceeds 50,000 URLs." Flags are inputs to policies (a policy
may check a flag as part of its evaluation), but flags are not policies.

## Why policies scale better than embedded business rules

1. **No duplication.** A policy is defined once and reused by every use case
   that needs it. `StorageQuotaPolicy` is used by `UploadMedia`, `CreatePage`,
   and any future use case that adds storage.

2. **Independent testability.** A policy is a pure function — test it with
   plain data, no mocks, no repositories, no infrastructure. An embedded rule
   requires a full use case integration test.

3. **Explicit catalog.** Every policy is listed in `docs/policies.md` with
   its inputs, evaluation, and failure behavior. A developer can audit the
   platform's business rules by reading one document. Embedded rules are
   invisible — you have to read every use case to find them.

4. **Composability.** Policies compose into chains (ordered, short-circuit)
   and composites (merge strategies). A use case assembles a chain from
   reusable policies rather than writing a monolithic validation block.

5. **Plugin extensibility.** A plugin can register a policy into the
   registry. Use case chains include plugin policies dynamically. Embedded
   rules offer no extension point — a plugin would have to monkey-patch the
   use case.

6. **Plan responsiveness.** Because the plan is an input to every policy,
   changing a plan's limits automatically changes policy outcomes. No code
   changes, no rule updates — just updated data.
