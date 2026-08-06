# Forms Aggregates

> **Status:** Architecture only. No implementation.

## Aggregates

### Form (Root)
- **Children:** FormField (child entity, loaded/saved/ordered through the root)
- **Value objects:** AuditTrail, FormFieldOption, FormFieldValidation, FormNotifications, FormSpamProtection
- **Invariants:** belongs to one Website, unique key within website, unique field keys within form, sortOrder contiguous, field types immutable
- **Repository:** FormRepository (includes FormFields)
- **Transaction boundary:** Form row + all FormField rows

### Submission (Root)
- **Children:** none
- **Value objects:** AuditTrail, SubmissionSource, SubmissionMeta, values (immutable)
- **Invariants:** belongs to one Form, values immutable after creation, only status can change, submittedAt immutable, status transitions are one-directional
- **Repository:** SubmissionRepository
- **Transaction boundary:** Submission row

See `docs/aggregates.md` §12–13 for full details.
