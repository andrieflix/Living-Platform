# Living Sites — Persistence Model

> **Status:** Architecture only. No database, no ORM, no SQL, no provider
> implementation. Only persistence concepts.

## Purpose

This document defines how aggregates are persisted, how reads are served, and
how consistency is maintained. Persistence follows aggregate boundaries, not
database table boundaries. The goal is to preserve business consistency
rather than mirror a normalized schema.

## Core Principle

**Persistence serves the aggregate, not the other way around.** A repository
persists an entire aggregate root (including child entities and value objects)
in one transaction. The database schema is an implementation detail of the
infrastructure layer — the application layer never sees tables, rows, or
joins.

## 1. Aggregate Persistence

### How aggregates are stored

Each aggregate root is persisted as a unit. The persistence shape depends on
the aggregate's structure:

| Aggregate Type | Persistence Shape | Rationale |
|---|---|---|
| Single-entity (Organization, User, Media) | One row in a table, with value objects as columns or JSON fields. | Simple, no children. |
| With child entities (Page+Sections, Form+Fields) | Root row + child rows in child tables, persisted in one transaction. | Children have their own identity but are loaded/saved with the root. |
| With embedded value objects (WebsiteSettings, ThemeTokens) | Value objects are JSON columns on the root row. | Value objects have no identity; they are part of the root. |
| Append-only snapshots (PageSnapshot) | One row per snapshot, with embedded section/SEO data as JSON. | Snapshots are immutable; JSON avoids join complexity for historical data. |

### Consistency within an aggregate

When a use case mutates an aggregate, the repository saves the entire
aggregate in a single database transaction. For a `Page` with 12 sections,
saving the page means:

1. Update the `pages` row (title, slug, status, sectionOrder, etc.).
2. Upsert all 12 `sections` rows.
3. Delete sections that were removed from the page.
4. All within one transaction — either the whole page state is saved or
   nothing is.

### Consistency across aggregates

Cross-aggregate consistency is NOT enforced by a database transaction. Instead:

- **References by ID.** A `Page` holds `websiteId` (an ID), not a reference to
  a `Website` object. The page does not load the website when it is loaded.
- **Domain events.** When an aggregate changes state that affects another
  aggregate, the use case emits a domain event. The affected aggregate reacts
  asynchronously.
- **Policies at use case level.** Cross-aggregate invariants (e.g. "only one
  homepage per website") are checked by policies at the use case level, which
  read from repositories before mutating. The check is a read, not a lock.

## 2. Snapshots

### What snapshots are

A **snapshot** is an immutable, point-in-time capture of an aggregate's
state. Snapshots are used for:

- **Published content.** When a page is published, a `PageSnapshot` is
  created. The snapshot captures the page's sections, SEO settings, and
  version. The live page continues to be editable; the snapshot is what the
  rendering layer serves to visitors.
- **Version history.** Each publish creates a new snapshot with an
  incremented version. Users can view the history of published versions.
- **Rollback.** A future rollback feature can restore a page to a previous
  snapshot's section state (creating a new draft, not mutating the snapshot).

### Snapshot rules

1. **Append-only.** A snapshot is never modified after creation. No UPDATE
   operations on snapshot rows.
2. **Immutable.** All fields are readonly — `version`, `publishedAt`,
   `sections`, `seo` are set at creation and never change.
3. **Retained indefinitely.** Snapshots are not subject to retention
   windows. They are the historical record of what was published.
4. **Versioned.** Each snapshot has a `version` string (semver or sequential)
   unique per `pageId`.

### Snapshot persistence shape

```
PageSnapshot {
  id: string              ← unique snapshot ID
  pageId: PageId          ← reference to the page (by ID)
  version: VersionString  ← e.g. "1.0.0", "1.0.1"
  publishedAt: ISODate    ← when the snapshot was created
  publishedBy: UserId?    ← who published
  sections: [             ← embedded JSON array (not a join)
    { sectionId, sectionTypeId, props, sortOrder }
  ]
  seo: SeoSnapshot?       ← embedded JSON
}
```

Sections are embedded as JSON in the snapshot rather than referenced by ID
because the live sections may change after publish. The snapshot must
capture the state at publish time, not a reference to mutable data.

## 3. Versioning

### Aggregate versioning

Every mutable aggregate has an implicit version for **optimistic
concurrency** (see §6 below). This is a numeric or timestamp version that
increments on every save. It is not a semantic version — it is a concurrency
token.

### Published content versioning

Published content uses **semantic versioning** via `PageSnapshot.version`:

- **Major.** Breaking structural change (new section type, removed section).
- **Minor.** Content change (text update, image swap, prop change).
- **Patch.** Metadata-only change (SEO settings, page title).

The version is assigned by the use case at publish time, based on a diff
between the current draft and the last published snapshot. The diff logic
lives in the application layer (a service), not in the aggregate.

### SectionType versioning

SectionTypes use semver for their `version` field. The
`SectionTypeVersionPolicy` checks backward compatibility when a new version
is registered. Incompatible versions require a migration path (a use case
that updates affected sections to the new schema).

## 4. Read Models

### What read models are

A **read model** is a projection of aggregate state optimized for queries.
Read models are not aggregates — they are derived data. They are:

1. **Immutable.** A read model is a snapshot of computed data at a point in
   time. It is not mutated in place; it is refreshed or rebuilt.
2. **Query-optimized.** Read models are shaped for the UI's needs — flat,
   denormalized, pre-joined. The UI never loads an aggregate to render a
   list.
3. **Separate from write models.** The write model is the aggregate; the
   read model is a projection. They may have different shapes, different
   storage, different lifecycles.

### Read models in Living Sites

| Read Model | Source Aggregates | Purpose |
|---|---|---|
| PageListRow | Page | Flat list of pages for the page manager (title, slug, status, lastUpdated). |
| MediaLibraryRow | Media, Folder | Flat list of media for the library grid (thumbnail, name, size, folder). |
| SubmissionListRow | Submission | Flat list of form submissions for the inbox (date, status, summary). |
| WebsiteDashboardRow | Website, Page, Media, Form | Website overview (page count, media count, form count, status). |
| SitemapEntry | Page, SEOProfile | Sitemap XML generation (URL, lastmod, changefreq, priority). |
| AnalyticsSummary | (event stream) | Aggregated metrics for the analytics dashboard. |
| ExportJobListRow | ExportJob | Flat list of export jobs (status, progress, date). |

### Read model lifecycle

Read models are generated in two ways:

1. **On-demand (query-time projection).** The use case queries the aggregate
   repository, maps the result to a read model, and returns it. No
   persistence — the read model is ephemeral, computed per request. This is
   the default for most lists.

2. **Pre-computed (materialized projection).** A background job or event
   handler builds and stores a read model. The stored read model is queried
   directly by the UI. This is used for expensive aggregations (analytics
   summaries, sitemaps for large sites).

### Read model rules

1. Read models are **never mutated by use cases**. A use case that changes
   aggregate state does not update the read model — it emits an event, and
   the projection handler updates the read model.
2. Read models are **eventually consistent** with aggregates. There is a
   brief window between aggregate mutation and read model update.
3. Read models are **immutable**. A projection handler creates a new version
   of the read model rather than mutating the old one. (In practice, this
   may be an UPSERT, but conceptually the old read model is replaced, not
   edited.)
4. Read model queries **never return aggregates**. A list endpoint returns
   read model rows; a detail endpoint may return the aggregate or a detailed
   read model.
5. Every read model carries **`ReadModelMetadata`** with `computedAt`,
   `sourceVersion`, and `projectionVersion`. This enables cache invalidation
   based on the source aggregate's version, staleness detection based on
   computation time, and projection-version awareness for schema evolution.
   These contracts are defined in `@livingsites/application/src/read-models/`.

## 5. Projection Models

### What projections are

A **projection** is the process that transforms aggregate state (or events)
into read models. Projections are one-directional: aggregate → read model.
There is no reverse projection (read model → aggregate).

### Projection types

| Type | Trigger | Use Case |
|---|---|---|
| **Event-driven projection** | A domain event is emitted after an aggregate mutation. The projection handler consumes the event and updates the read model. | Page published → sitemap projection updates. |
| **Scheduled projection** | A cron job rebuilds the read model from current aggregate state. | Analytics summary rebuilt every hour. |
| **On-demand projection** | A query use case computes the read model from aggregate state at query time. | Page list — computed per request, not stored. |

### Projection contracts (future)

The application layer will define a `Projection` interface that event-driven
projections implement. The composition root registers projections with the
event bus. This milestone defines the concept; implementation is future.

## 6. Caching Strategy

### What to cache

| Data | Cache? | TTL | Invalidation |
|---|---|---|---|
| Aggregate by ID (e.g. `Page.findById`) | Yes (read-through) | 60s | On mutation (write-through invalidation). |
| Aggregate lists (e.g. `Page.list`) | Yes (read-through) | 30s | On any mutation to that aggregate type for that scope. |
| Read models (on-demand projections) | Yes (result cache) | 30s | On aggregate mutation event. |
| Read models (materialized) | No (already pre-computed) | — | Updated by projection handler. |
| Published page snapshots | Yes (long-lived) | 1h | Snapshots are immutable — cache indefinitely, invalidate on new publish. |
| SectionType registry | Yes (long-lived) | 5m | On SectionType registration/unregistration. |
| Plan / Feature | Yes (long-lived) | 5m | On Plan or Feature mutation. |
| Analytics summaries | No (external) | — | Always fetched fresh or pre-computed. |

### Cache rules

1. **Cache is optional.** If no cache adapter is configured, use cases fall
   back to direct repository reads. Cache is a performance optimization, not
   a correctness dependency.
2. **Cache keys are namespaced.** Keys include the context and scope (e.g.
   `pages:{websiteId}:{pageId}`) to enable prefix-based invalidation.
3. **Write-through invalidation.** When a use case mutates an aggregate, it
   invalidates the cache entry for that aggregate and its list caches. This
   happens after the transaction commits, not before.
4. **Never cache across org boundaries.** Cache keys always include the
   org/website ID to prevent cross-tenant data leakage.

## 7. Lazy Loading

### Principle

**Aggregates are loaded eagerly, in full.** When a repository loads an
aggregate root, it loads all child entities and value objects in the same
query (or a small number of queries within the same transaction). There is
no lazy loading of child entities.

### Rationale

Lazy loading within an aggregate breaks the aggregate's consistency
guarantee. If sections are lazy-loaded after the page, the page's
`sectionOrder` invariant cannot be checked at load time — some sections might
not be loaded yet. Eager loading ensures the aggregate is always in a
consistent state when returned from the repository.

### What is lazy-loaded

- **References to other aggregates.** A `Page` holds `websiteId` but does not
  load the `Website` aggregate. If the use case needs the website, it loads it
  separately via `WebsiteRepository.findById(websiteId)`.
- **Read models.** A read model is not loaded with the aggregate — it is a
  separate query.
- **Media content.** A `Media` aggregate holds metadata, not the file bytes.
  File bytes are fetched from the storage adapter on demand (presigned URL).

### Eager loading patterns

For aggregates with child entities (Page+Sections, Form+Fields,
Navigation+Items), the repository uses a single query with a join, or two
queries (root + children) executed in the same transaction. The result is
assembled into the aggregate root before returning.

## 8. Optimistic Concurrency

### Principle

**All mutable aggregates use optimistic concurrency.** No pessimistic locks
(select for update). Concurrency conflicts are detected via a version field
and resolved by the client retrying.

### Initial-version convention

**Version 0 before first persistence; version 1 after the first successful
save.** A new aggregate is constructed with `version: 0` (the
`INITIAL_AGGREGATE_VERSION` constant). The caller passes the candidate to
the repository's `create` method. No `expectedVersion` is needed — create
is not a mutation. On success, the stored version becomes 1. Every
subsequent save passes the version that was loaded. This convention is
applied uniformly — no aggregate uses a different starting version.

### How it works

1. Each mutable aggregate root has a required `version: AggregateVersion`
   field (a monotonically increasing number, defined in `@livingsites/domain`
   as `type AggregateVersion = number`). The field is mandatory on the
   entity contract — the TypeScript compiler enforces its presence.
2. When a repository loads an aggregate, the version is included.
3. When a repository creates an aggregate, it takes a candidate (no id,
   no version) and returns the created aggregate with version 1. When a
   repository saves an existing aggregate, it requires `expectedVersion`
   as a second parameter and checks that the version in the database
   matches. If it matches, the save proceeds and the version is
   incremented exactly once. If it does not match, the save fails with a
   typed `ConcurrencyConflict` error (defined in `@livingsites/domain`)
   carrying the aggregate ID, expected version, and actual version.
   Creation conflicts (duplicate key, persistence unavailable) return
   typed Application errors (DuplicateKeyError,
   PersistenceUnavailableError) — never ConcurrencyConflict.
4. The use case returns the `ConcurrencyConflict` to the UI. The UI can
   reload the aggregate and retry the mutation.
5. Callers must **not** silently retry mutations. A concurrency conflict
   means the aggregate was modified by another operation — the caller must
   reload and re-evaluate before retrying. Automatic retries are allowed
   only for explicitly safe, idempotent operations (e.g. setting a flag to
   a specific value regardless of intermediate changes).

### Child entities share the root's concurrency boundary

Child entities (Section, FormField, MenuItem, WebsiteSettings) do **not**
carry their own `AggregateVersion`. They share the aggregate root's
concurrency boundary:

- A change to Sections increments `Page.version`.
- A change to FormFields increments `Form.version`.
- A change to MenuItems increments `Navigation.version`.
- A change to WebsiteSettings increments `Website.version`.

The root's version is the single concurrency token for the entire aggregate.
A save that modifies any child entity increments the root's version exactly
once, even if multiple children changed in the same transaction.

### Submission concurrency strategy

Submission is an aggregate root with append-only payload but mutable status.
The `values` and `meta` fields are immutable after creation. The `status`
field follows a state machine (new → read → replied → archived / spam).

Because status transitions are real mutations that can conflict (two staff
members updating the same submission concurrently), Submission carries an
`AggregateVersion` and its `updateStatus` repository method requires
`expectedVersion`. The `create` method (creating a new submission) does not
require `expectedVersion` — it is a create operation starting from
`INITIAL_AGGREGATE_VERSION`.

### Exception: sole-owner invariant

The sole-owner invariant (an Organization must always retain at least one
active owner) is enforced with **strong consistency**, not optimistic
concurrency. Owner-changing operations (removal, demotion, archival,
transfer of the final active owner) execute through a dedicated transaction
boundary using an implementation-appropriate concurrency mechanism (scoped
locking, serializable transaction, advisory locking, or a database constraint
combined with transaction logic). This prevents two concurrent owner-removal
operations from both succeeding and leaving the organization ownerless.

The specific concurrency mechanism is selected at the infrastructure layer.
The domain requires only that the operation is atomic and that no race
condition can leave an organization without an active owner.

Platform-admin recovery (manually re-assigning ownership after an
organization is left ownerless) is emergency remediation only, not a normal
consistency mechanism. The architecture's goal is that this recovery is never
needed under normal operation.

### Implementation shape (conceptual)

```
save(page):
  UPDATE pages SET ..., version = version + 1
  WHERE id = page.id AND version = page.version

  if rowCount === 0:
    throw ConcurrentModification(page.id, page.version)
```

This is the conceptual shape. The actual SQL is an infrastructure concern —
this milestone defines only the concept.

### What about builder sessions?

The builder has `SessionConcurrencyPolicy` and `ConflictDetectionPolicy`.
These are business-level concurrency checks (are two users editing the same
page?) that operate above the optimistic concurrency mechanism. Optimistic
concurrency prevents lost updates at the database level; the builder
policies prevent conflicting edits at the business level.

## 9. Soft Deletes

### Principle

**Most aggregates use soft delete.** A soft delete sets `status =
"archived"` (or `"deleted"`) rather than removing the row. This preserves
data for retention requirements and allows undo within the retention window.

### Soft delete by aggregate

| Aggregate | Soft delete? | Status field | Retention |
|---|---|---|---|
| Organization | Yes | `status: "archived"` | Indefinite (archived orgs retained). |
| User | Yes | `status: "deleted"` | Retention period, then hard-delete. |
| Membership | No (hard delete) | — | Removed immediately. |
| Website | Yes | `status: "archived"` | Retention period, then hard-delete. |
| Page | Yes | `status: "archived"` | Retained with website. |
| Section | Yes | `status: "deleted"` | Removed when page is hard-deleted. |
| Media | Yes | `status: "archived"` | Retention period, then purge storage + hard-delete. |
| Folder | No (hard delete) | — | Media re-parented, then folder removed. |
| Form | Yes | `status: "archived"` | Retained with website. |
| Submission | Conditional | `status: "archived"` | Hard-deleted on GDPR erasure request. |
| Theme | Yes | `isActive: false` | Retained for reference. |
| Navigation | No (hard delete) | — | Deleted with website. |
| ExportJob | No (retention-based) | `status: "expired"` | Output purged; job record retained. |

### Soft delete rules

1. **Soft-deleted aggregates are excluded from default queries.** Repository
   `list` and `findById` methods do not return soft-deleted aggregates unless
   an explicit `includeDeleted` filter is set.
2. **Soft delete is not a status transition.** A soft-deleted aggregate
   cannot be "un-archived" through a normal mutation — a dedicated `restore`
   use case is required (e.g. `RestoreWebsite`, `RestoreMedia`).
3. **Restore is time-bound.** `ArchiveRetentionPolicy` checks whether the
   retention window has expired before allowing restore.

## 10. Archival Strategy

### What archival is

Archival is the process of moving soft-deleted aggregates from active storage
to long-term retention, then eventually purging them. Archival applies to:

- **Organizations.** Archived orgs retain all data indefinitely. The org is
  invisible to the owner but visible to platform admins.
- **Websites.** Archived websites are retained for the retention period (e.g.
  90 days), then hard-deleted (all pages, sections, media, forms are
  cascade-deleted by a background job).
- **Media.** Archived media metadata is retained for the retention period,
  then the storage object is purged and the metadata row is hard-deleted.
- **Export jobs.** Completed job outputs (download URLs) expire after the
  retention period. The job record is retained for audit.

### Archival lifecycle

```
Active → Archived (soft delete by user)
           → Retention period (90 days, configurable)
             → Hard delete (background job purges data)
```

### Background job

A scheduled background job (via `QueueAdapter`) runs the archival sweep:

1. Find all aggregates with `status = "archived"` and `audit.updatedAt`
   older than the retention period.
2. For each expired aggregate, cascade-delete children (e.g. website → pages
   → sections).
3. For media, purge the storage object before deleting the metadata row.
4. Log each purge operation via the platform logger.

### What archival does NOT apply to

- **PageSnapshots.** Snapshots are retained indefinitely. They are the
  historical record of published content and are not subject to archival.
- **Plans and Features.** These are deactivated (`isActive = false`), not
  archived. Deactivation is reversible.
- **SectionTypes.** Deactivated, not archived. Deactivation prevents new
  placement but retains the definition for existing sections.

## Summary

| Concept | Rule |
|---|---|
| Aggregate persistence | One transaction per aggregate. Root + children saved atomically. |
| Snapshots | Append-only, immutable, retained indefinitely. |
| Versioning | Optimistic concurrency version on all mutable aggregates. Semantic versioning for published snapshots. |
| Read models | Immutable projections, eventually consistent, never mutated by use cases. |
| Projections | One-directional (aggregate → read model). Event-driven, scheduled, or on-demand. |
| Caching | Optional, namespaced, write-through invalidation, never cross-tenant. |
| Lazy loading | Aggregates loaded eagerly. Cross-aggregate references by ID only. |
| Optimistic concurrency | `AggregateVersion` on all mutable aggregate roots. Typed `ConcurrencyConflict` on version mismatch. No pessimistic locks. Exception: sole-owner invariant uses strong consistency. |
| Soft deletes | Most aggregates. Excluded from default queries. Restore within retention window. |
| Archival | Background job purges expired soft-deletes after retention period. Snapshots retained indefinitely. |
