# Content (Page + Section) Use Cases

> **Status:** Architecture only. No implementation.

## Commands

- `CreatePage` — Create a new page with slug, title, and optional parent.
- `UpdatePageContent` — Change page title, description, or section order.
- `MoveSection` — Reorder a section within a page.
- `AddSection` — Add a new section from a SectionType.
- `UpdateSection` — Change section props (validated against SectionType schema).
- `RemoveSection` — Remove a section from a page.
- `SetHomepage` — Designate a page as the website homepage.
- `ArchivePage` — Soft-delete a page.
- `RestorePage` — Restore an archived page.

## Queries

- `GetPage`, `ListPages`, `GetPageTree`, `GetSection`, `ListSectionTypes`,
  `GetPublishedPage` (public, reads from snapshot).

## Long-running Operations

- `PublishPage` — Validate sections, freeze props, create PageSnapshot, update status.
- `SchedulePublish` — Schedule `PublishPage` for a future time.
- `UnpublishPage` — Revert to draft, remove from public rendering.
- `RestoreSnapshot` — Create a new snapshot from an old one (rollback).

## Background Jobs

- `ExecuteScheduledPublish` — Run `PublishPage` for scheduled pages.
- `PurgeArchivedPages` — Hard-delete archived pages past retention.

## Events Produced

`PageCreated`, `PageContentUpdated`, `PagePublished`, `PageUnpublished`,
`PageScheduled`, `PageArchived`, `PageRestored`, `SectionAdded`,
`SectionUpdated`, `SectionRemoved`, `SnapshotRestored`.

## Events Consumed

`WebsiteArchived` → cascade-archive all pages. `SectionTypeUninstalled` →
mark sections as orphaned.

## External Dependencies

Database provider, SectionType registry (schema validation).

## Authorization

Website `editor`+: create, update, archive, restore. Website `admin`+:
set homepage, publish. Public: `GetPublishedPage` only.

## Future Extension Points

Page templates, collaborative editing, scheduled unpublish, page-level SEO
overrides.

See `docs/use-cases.md` §3 for the full catalog.
