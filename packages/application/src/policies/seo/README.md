# SEO Policies

> **Status:** Architecture only. No implementation.

## Purpose

Govern sitemap, robots, and structured data configuration.

## Policies

| Policy | Severity | Summary |
|---|---|---|
| `RobotsPolicyConflictPolicy` | soft | Warn if robots rules block the entire site. |
| `SitemapSizePolicy` | soft | Warn if sitemap exceeds 50,000 URLs. |
| `SchemaValidPolicy` | hard | Deny if JSON-LD schema is malformed. |
| `CanonicalUrlPolicy` | soft | Warn if canonical URL duplicates another page. |
| `MetaDescriptionPolicy` | soft | Warn if the page is missing a meta description. |

## Inputs

`websiteId`, `pageId`, `robotsRules`, `pageCount`, `schemaProfile`, `seoProfile`.

## Evaluation

SEO policies are advisory-heavy — many produce warnings rather than hard
denials. The use case decides whether to proceed with warnings or surface
them to the user for confirmation.

See `docs/policies.md` §4 for the full catalog.
