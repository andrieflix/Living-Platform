# Analytics Aggregates

> **Status:** Architecture only. No implementation.

## Aggregates

### AnalyticsProfile (Root)
- **Children:** none
- **Value objects:** AuditTrail, config (opaque provider config with SecretRefs)
- **Invariants:** one profile per website per provider, valid provider enum, config contains credential references not raw secrets
- **Repository:** AnalyticsProfileRepository
- **Transaction boundary:** AnalyticsProfile row

Note: AnalyticsSummary, MetricSeries, MetricPoint, PageAnalyticsRow,
ReferrerRow, and GeoRow are **read models** (projections from event
streams or external analytics APIs), not aggregates. They are not persisted
as domain state — they are computed on demand or pre-aggregated by
background jobs.

See `docs/aggregates.md` §18 for full details.
