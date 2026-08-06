# Website Aggregates

> **Status:** Architecture only. No implementation.

## Aggregates

### Website (Root)
- **Children:** WebsiteSettings (child entity, loaded/saved with root)
- **Value objects:** AuditTrail, password protection config, social defaults
- **Invariants:** belongs to one Org, unique slug within org, unique custom/fallback domain, defaultLocale in enabledLocales
- **Repository:** WebsiteRepository (includes WebsiteSettings)
- **Transaction boundary:** Website row + WebsiteSettings row

See `docs/aggregates.md` §6 for full details.
