# Export Aggregates

> **Status:** Architecture only. No implementation.

## Aggregates

### ExportJob (Root)
- **Children:** none
- **Value objects:** AuditTrail, ExportScope (discriminated union)
- **Invariants:** belongs to one Website + one Org, progress 0..1, status state machine (pending→queued→processing→completed/failed/canceled, completed→expired), downloadUrl set only on completed
- **Repository:** ExportJobRepository
- **Transaction boundary:** ExportJob row (progress updates are individual transactions; file generation is async, no open transaction)

See `docs/aggregates.md` §19 for full details.
