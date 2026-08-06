# Feature Flags

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The feature-flags module provides a **runtime feature-flag contract** that
services consult to determine whether a feature is enabled for a given
context (organization, website, or globally). Feature flags are dynamic —
they can change at runtime without redeployment — and are distinct from
domain `Feature` entities (which are plan-gated entitlements) and from config
(which is static at boot).

## Planned contracts

- **`FeatureFlagProvider`** — resolves flag state from a source (in-memory
  map, remote flag service, database). The composition root selects the
  provider.
- **`FlagKey`** — a typed, named flag identifier.
- **`FlagContext`** — the evaluation context: organization id, website id,
  user id, locale. Flags can be evaluated globally, per-org, or per-website.
- **`FlagResolution`** — the result of evaluating a flag: enabled boolean,
  variant string (for A/B testing), and the reason (e.g. `default`,
  `override`, `rule_match`).

## Principles

1. **Flags are dynamic.** A flag's state can change at runtime. Services
   re-evaluate flags per operation, never cache the result long-term.
2. **Flags fail open or closed, explicitly.** If the flag provider is
   unavailable, the contract returns a configurable default (on or off),
   never throws.
3. **Flags are not entitlements.** Domain `Feature` entities gate capabilities
   by plan. Feature flags gate rollout and experimentation. A service may
   check both: entitlement (does the plan include this?) and flag (is this
   rolled out to this org?).
4. **Flags support variants.** A flag is not just boolean; it can return a
   variant string for A/B testing and staged rollouts.
