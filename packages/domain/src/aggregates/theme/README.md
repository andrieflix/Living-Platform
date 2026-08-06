# Theme Aggregates

> **Status:** Architecture only. No implementation.

## Aggregates

### Theme (Root)
- **Children:** none
- **Value objects:** AuditTrail, ThemeTokens (serializable design-token block)
- **Invariants:** unique key within org, system themes immutable, supportedSectionTypes must be active
- **Repository:** ThemeRepository
- **Transaction boundary:** Theme row (with embedded tokens and supportedSectionTypes)

See `docs/aggregates.md` §14 for full details.
