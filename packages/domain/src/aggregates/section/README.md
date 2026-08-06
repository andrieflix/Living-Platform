# Section Aggregates

> **Status:** Architecture only. No implementation.

## Aggregates

### SectionType (Root)
- **Children:** none (Section is a child of Page, not of SectionType)
- **Value objects:** AuditTrail, propsSchema (opaque JSON schema)
- **Invariants:** unique key platform-wide, semver version, system types cannot be deleted, unregister warns if sections are orphaned
- **Repository:** SectionTypeRepository / SectionTypeRegistry
- **Transaction boundary:** SectionType row

Note: Section is NOT an aggregate root and has no public repository port.
It is a child entity of the Page aggregate. Sections are loaded, mutated,
and persisted through the PageRepository. A future database adapter may use
private table mappers for sections internally, but those are not exposed as
application-layer ports.

See `docs/aggregates.md` §9 for full details.
