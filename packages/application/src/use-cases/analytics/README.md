# Analytics Use Cases

> **Status:** Architecture only. No implementation.

## Commands

- `UpdateAnalyticsProfile` — Configure the analytics provider for a website.
- `EnableAnalytics` — Turn analytics tracking on.
- `DisableAnalytics` — Turn analytics tracking off.
- `FlushMetrics` — Force-flush buffered events to the provider.

## Queries

- `GetAnalyticsProfile`, `GetMetrics`, `GetPageMetrics`, `GetTrafficSources`.

## Long-running Operations

None. Analytics queries proxy to the provider synchronously (with caching).

## Background Jobs

- `SyncMetrics` — Pull metrics into local cache (hourly).
- `FlushEventBuffer` — Flush buffered events to the provider.

## Events Produced

`AnalyticsProfileUpdated`, `AnalyticsEnabled`, `AnalyticsDisabled`.

## Events Consumed

`WebsiteArchived` → disable analytics, stop syncing. `PagePublished` →
register page URL with the provider (if supported).

## External Dependencies

Analytics provider SDK (Google Analytics, Plausible, Fathom), database
provider (profile, cached metrics).

## Authorization

Website `admin`+: configure, enable/disable. Website `editor`+: view metrics.

## Future Extension Points

Custom dashboards, goal/conversion tracking, real-time analytics,
multi-provider support.

See `docs/use-cases.md` §7 for the full catalog.
