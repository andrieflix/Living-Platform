# SEO Aggregates

> **Status:** Architecture only. No implementation.

## Aggregates

### SEOProfile (Root)
- **Children:** none
- **Value objects:** AuditTrail, locale overrides
- **Invariants:** belongs to one Website, one profile per page (or one website-default), ogImageMediaId in same website
- **Repository:** SEORepository
- **Transaction boundary:** SEOProfile row

### SchemaProfile (Root)
- **Children:** none
- **Value objects:** AuditTrail, payload (JSON-LD template)
- **Invariants:** unique key within website, valid schemaType, pageIds in same website
- **Repository:** SchemaProfileRepository
- **Transaction boundary:** SchemaProfile row

Note: SitemapEntry and RobotsPolicy are read models / configuration
projections, not aggregates. They are derived from published pages and SEO
profiles.

See `docs/aggregates.md` §16–17 for full details.
