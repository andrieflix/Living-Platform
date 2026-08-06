# SEO Use Cases

> **Status:** Architecture only. No implementation.

## Commands

- `UpdateSEOProfile` — Set website-level SEO defaults (meta, OG, Twitter cards).
- `UpdatePageSEO` — Override SEO settings for a specific page.
- `UpdateRobotsPolicy` — Set robots.txt rules.
- `UpdateSchemaProfile` — Set structured data (JSON-LD) defaults.
- `SubmitToSearchEngines` — Notify Google/Bing of a sitemap update.

## Queries

- `GetSEOProfile`, `GetPageSEO`, `GetRobotsPolicy`, `GetSchemaProfile`,
  `GetSitemap` (public, XML).

## Long-running Operations

None.

## Background Jobs

- `RegenerateSitemap` — Rebuild sitemap after content changes.
- `PingSearchEngines` — Submit sitemap URL to Google/Bing.

## Events Produced

`SEOProfileUpdated`, `PageSEOUpdated`, `RobotsPolicyUpdated`,
`SchemaProfileUpdated`, `SitemapRegenerated`.

## Events Consumed

`PagePublished` / `PageUnpublished` / `PageArchived` → trigger
`RegenerateSitemap`. `CustomDomainAssigned` → update sitemap base URL.

## External Dependencies

Database provider, search engine ping APIs (Google, Bing).

## Authorization

Website `editor`+: update SEO profiles and page SEO. Website `admin`+:
robots policy, search engine submission.

## Future Extension Points

Page-level schema overrides, redirect manager, SEO scoring, multi-domain
sitemaps.

See `docs/use-cases.md` §6 for the full catalog.
