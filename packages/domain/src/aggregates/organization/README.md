# Organization Aggregates

> **Status:** Architecture only. No implementation.

## Aggregates

### Organization (Root)
- **Children:** none (FeatureOverride is a value object)
- **Invariants:** unique slug, required billing email, no duplicate feature overrides, no hard-delete
- **Repository:** OrganizationRepository
- **Transaction boundary:** Organization row + featureOverrides array

### Plan (Root)
- **Children:** none (FeatureEntitlement is a value object)
- **Invariants:** unique tier, non-negative limits, archive instead of hard-delete
- **Repository:** PlanRepository
- **Transaction boundary:** Plan row + entitlements array

### Feature (Root)
- **Children:** none
- **Invariants:** unique key, immutable valueType, deactivate instead of delete
- **Repository:** FeatureRepository
- **Transaction boundary:** Feature row

See `docs/aggregates.md` §1–3 for full details.
