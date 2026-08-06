# Navigation Aggregates

> **Status:** Architecture only. No implementation.

## Aggregates

### Navigation (Root)
- **Children:** MenuItem (child entity, loaded/saved with root, supports nesting)
- **Value objects:** AuditTrail, MenuTarget (discriminated union)
- **Invariants:** belongs to one Website, unique key within website, unique item IDs, no circular refs
- **Repository:** NavigationRepository (includes MenuItems)
- **Transaction boundary:** Navigation row + items array

See `docs/aggregates.md` §15 for full details.
