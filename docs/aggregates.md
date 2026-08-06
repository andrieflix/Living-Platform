# Living Sites — Aggregate and Persistence Model

> **Status:** Architecture only. No implementation, no database, no ORM.

## Purpose

This document defines the **Aggregate** boundaries for every bounded context
in the Living Sites platform, following Domain-Driven Design. An aggregate is
a cluster of domain objects treated as a single consistency unit. Each
aggregate has one **Aggregate Root** — the only entry point for mutations.
Child entities and value objects are accessible only through the root.

Persistence follows aggregate boundaries, not database table boundaries.
A repository owns an aggregate root and persists the entire cluster in one
transaction. This preserves business consistency over table normalization.

## Aggregate Principles

1. **Aggregate Root is the only entry point.** External code references
   child entities only through the root. No direct repository access to
   children.
2. **Repositories own Aggregate Roots only.** There is no `SectionRepository`
   that loads a `Section` independently of its `Page` — sections are loaded
   and mutated through the `Page` aggregate root. Child entities never have
   public repository ports.
3. **Transactions never cross aggregate boundaries.** A single transaction
   persists one aggregate. Cross-aggregate coordination uses domain events,
   eventual consistency, or saga patterns.
4. **Aggregates enforce invariants.** The aggregate root validates that its
   internal state is consistent before accepting a mutation. Invariants are
   business rules that must always hold within the aggregate.
5. **References between aggregates are by ID only.** An aggregate holds the
   ID of another aggregate, never a direct object reference. This prevents
   accidental lazy-loading across aggregate boundaries.
6. **Snapshots are append-only.** Published page snapshots are immutable
   records. A new publish creates a new snapshot; old snapshots are never
   mutated.
7. **Every mutable aggregate root carries an optimistic concurrency version.**
   The version is a monotonically increasing `AggregateVersion` (number).
   A repository save requires the expected version and fails with a
   `ConcurrencyConflict` if the stored version differs. Immutable aggregates
   (PageSnapshot) do not carry a version — they are never updated.
8. **Aggregate definitions belong to the Domain layer.** Aggregate roots,
   child entities, invariants, value objects, and consistency boundaries are
   domain concepts. The Application layer defines repository contracts and
   use cases that operate through aggregate-root repositories.
9. **No generic AggregateRoot framework or superclass.** Aggregates are plain
   domain entities with documented boundaries. A base class or framework is
   not introduced without a separate approved ADR.
10. **Every mutable aggregate root carries a required `version:
    AggregateVersion` field.** The field is mandatory on the entity
    contract — the TypeScript compiler enforces its presence. Child entities
    do not carry an independent version; they share the root's concurrency
    boundary. A change to Sections increments `Page.version`. A change to
    FormFields increments `Form.version`. A change to MenuItems increments
    `Navigation.version`. A change to WebsiteSettings increments
    `Website.version`. Immutable aggregates (PageSnapshot) do not carry a
    mutable concurrency version — they use `revisionNumber` for immutable
    publication history. Repository creation and mutation are separate
    operations: `create` takes a candidate (no id, no version) and returns
    version 1; `save` takes an aggregate with id and `expectedVersion` and
    increments the version exactly once. Creation conflicts return typed
    Application errors (DuplicateKeyError, PersistenceUnavailableError),
    not ConcurrencyConflict. The initial-version convention is version 0
    before first persistence, version 1 after the first successful create.
    RepositoryError, SaveResult, CreateResult, and all
    repository-operation-specific result/error contracts live in
    @livingsites/application — Domain contains only ConcurrencyConflict and
    AggregateVersion.

## Aggregate Catalog

---

## 1. Organization Aggregate

### Aggregate Root

`Organization`

### Child Entities

None. `FeatureOverride` is a value object stored on the root.

### Value Objects

- `FeatureOverride` — per-org entitlement override
- `AuditTrail` — creation and modification metadata

### Invariants

- An organization's slug is unique across the platform.
- An organization must have a billing email.
- `featureOverrides` must not duplicate `featureId` entries.
- An organization cannot be hard-deleted; it is archived.

### Consistency Rules

- Plan assignment: `planId` must reference an active `Plan` (checked by
  `PlanActivePolicy` at the use case level).
- Feature overrides: overrides are validated against the plan's baseline
  entitlements at the use case level.

### Repository Owner

`OrganizationRepository` — owns the `Organization` aggregate root. Also owns
`Plan` and `Feature` as separate aggregate roots (platform-global, not
org-scoped).

### Lifecycle

- Created → Active → Archived → (retained for retention period)
- Cannot be hard-deleted. Archive is terminal for user-facing purposes;
  physical deletion occurs after the retention window.

### Transaction Boundary

Single `Organization` row + its `featureOverrides` array. One transaction.

---

## 2. Plan Aggregate

### Aggregate Root

`Plan`

### Child Entities

None. `FeatureEntitlement` is a value object stored on the root.

### Value Objects

- `FeatureEntitlement` — grant of a Feature with a value
- `AuditTrail`

### Invariants

- Plan tier is unique.
- `maxWebsites` and `maxMembers` are non-negative or null (unlimited).
- A plan with active organizations cannot be hard-deleted; it is archived
  (`isActive = false`).

### Consistency Rules

- Entitlements reference valid `Feature` IDs.
- Archiving a plan does not affect existing orgs on that plan (they retain
  their current limits until they change plans).

### Repository Owner

`PlanRepository` — owns the `Plan` aggregate root. Platform-global scope.

### Lifecycle

- Created → Active → Archived (`isActive = false`)
- Archiving is reversible until orgs are migrated off.

### Transaction Boundary

Single `Plan` row + its `features` (entitlements) array. One transaction.

---

## 3. Feature Aggregate

### Aggregate Root

`Feature`

### Child Entities

None.

### Value Objects

- `AuditTrail` (implicit)

### Invariants

- Feature key is unique across the platform.
- `valueType` is immutable after creation (changing it would invalidate
  existing entitlements and overrides).

### Consistency Rules

- A feature cannot be hard-deleted while any plan references it. Deactivation
  (`isActive = false`) is the soft-delete path.

### Repository Owner

`FeatureRepository` — owns the `Feature` aggregate root. Platform-global.

### Lifecycle

- Created → Active → Inactive

### Transaction Boundary

Single `Feature` row. One transaction.

---

## 4. User Aggregate

### Aggregate Root

`User`

### Child Entities

None. `Membership` is a separate aggregate (see below).

### Value Objects

- `AuditTrail`

### Invariants

- Email is unique and lowercased.
- A user cannot be hard-deleted while active memberships exist. Soft-delete
  (`status = "deleted"`) is the removal path.

### Consistency Rules

- User identity is platform-global, not org-scoped.
- Permissions are derived from `Membership` aggregates, never from a field on
  `User`.

### Repository Owner

`UserRepository` — owns the `User` aggregate root. Platform-global scope.

### Lifecycle

- Created → Active → Deleted (soft)
- Hard deletion occurs only after all memberships are removed and the
  retention window expires.

### Transaction Boundary

Single `User` row. One transaction.

---

## 5. Membership Aggregate

### Aggregate Root

`Membership`

### Child Entities

None.

### Value Objects

- `AuditTrail`

### Invariants

- A membership binds exactly one `User` to one `Organization` with one `Role`.
- A user cannot have two memberships in the same organization with the same
  website scope.
- **Sole-Owner invariant (strongly consistent):** An Organization must always
  retain at least one active owner membership. Removing, demoting, archiving,
  or transferring the final active owner is denied unless a replacement owner
  is established in the same transaction. This invariant is enforced through
  a dedicated transaction boundary using an implementation-appropriate
  concurrency mechanism (scoped locking, serializable transaction, advisory
  locking, or a database constraint combined with transaction logic). The
  specific mechanism is selected at the infrastructure layer — the domain
  requires only that the operation is atomic and that no race condition can
  leave an organization ownerless. Platform-admin recovery (manually
  re-assigning ownership) is emergency remediation only, not a normal
  consistency mechanism.

### Consistency Rules

- Role must be a valid system role or custom role key.
- Website scope, if set, must reference a website in the same org.

### Repository Owner

`MembershipRepository` — owns the `Membership` aggregate root. Scoped to an
organization (queried by `organizationId`).

### Lifecycle

- Created → Active → Removed (hard-deleted; memberships are not archived)

### Transaction Boundary

Single `Membership` row. One transaction. **Exception:** owner-changing
operations (removal, demotion, archival, transfer of the final active owner)
execute through one dedicated transaction boundary that enforces the
sole-owner invariant with strong consistency. The transaction scope includes
a read of all active owner memberships for the organization, the mutation,
and the consistency check — all within a concurrency mechanism that prevents
two concurrent owner-removal operations from both succeeding. This is not a
cross-aggregate transaction — it operates within the Membership aggregate
scope, using a concurrency mechanism to serialize conflicting operations.

---

## 6. Website Aggregate

### Aggregate Root

`Website`

### Child Entities

- `WebsiteSettings` — a child entity of the Website root. Settings are
  loaded and saved with the website. They have no independent lifecycle.

### Value Objects

- `AuditTrail`
- Password protection config (value object within settings)
- Social defaults (value object within settings)

### Invariants

- A website always belongs to exactly one `Organization`.
- Website slug is unique within an organization.
- `customDomain` is unique across the platform (if set).
- `fallbackDomain` is unique across the platform.
- `defaultLocale` must be in `enabledLocales`.
- `SingleHomepagePolicy`: only one page per website can be the homepage
  (checked via `Page` aggregate, not here — cross-aggregate).

### Consistency Rules

- `themeId` must reference an active `Theme`.
- `publishedVersion` references a `PageSnapshot` version (cross-aggregate by
  ID).
- Custom domain availability is checked by `CustomDomainAvailabilityPolicy`.

### Repository Owner

`WebsiteRepository` — owns the `Website` aggregate root (including
`WebsiteSettings` as a child entity). `WebsiteSettingsRepository` is a
sub-repository owned by the website aggregate — it loads/saves settings
through the website root.

### Lifecycle

- Draft → Published → Unpublished → Archived
- Archived websites retain data for the retention window.
- Restore from archive is allowed within the retention window.

### Transaction Boundary

`Website` row + `WebsiteSettings` row. One transaction.

---

## 7. Page Aggregate

### Aggregate Root

`Page`

### Child Entities

- `Section` — sections are child entities of the Page root. A section cannot
  exist without a page. Sections are loaded, ordered, and mutated through the
  page root.

### Value Objects

- `AuditTrail`
- `SectionSnapshotEntry` (in snapshots, not in the live aggregate)
- `SeoSnapshot` (in snapshots)

### Invariants

- A page always belongs to exactly one `Website`.
- Page slug is unique within a website (`SlugUniquenessPolicy`).
- Only one homepage per website (`SingleHomepagePolicy`).
- `sectionOrder` must contain exactly the IDs of all active sections on the
  page — no orphans, no duplicates.
- A section's `sectionTypeId` must reference an active `SectionType`.
- Section props must validate against the `SectionType`'s `propsSchema`
  (`SectionValidationPolicy`).

### Consistency Rules

- `parentId` (if set) must reference another page in the same website.
- `publishedRevisionNumber` references a `PageSnapshot` by `revisionNumber` (cross-aggregate reference).
- Reordering sections is a single mutation on the page root — it updates
  `sectionOrder` and each section's `sortOrder` atomically.

### Repository Owner

`PageRepository` — owns the `Page` aggregate root (including its `Section`
child entities). `SectionRepository` is a sub-repository that loads/saves
sections through the page root.

### Lifecycle

- Draft → Published → Scheduled → Archived
- Publishing creates an immutable `PageSnapshot` (append-only).
- Archiving a page does not delete its snapshots.

### Transaction Boundary

`Page` row + all `Section` rows for that page. One transaction. Adding,
removing, or reordering sections is atomic with the page mutation.

---

## 8. PageSnapshot Aggregate

### Aggregate Root

`PageSnapshot`

### Child Entities

None. `SectionSnapshotEntry` is a value object stored on the root.

### Value Objects

- `SectionSnapshotEntry` — serialized section state at publish time
- `SeoSnapshot` — serialized SEO state at publish time

### Invariants

- Snapshots are **append-only and immutable**. Once created, a snapshot is
  never modified.
- `revisionNumber` is unique per `pageId` and increases monotonically.
- `publishedAt` is set at creation time and never changes.

### Consistency Rules

- A snapshot's sections must match the page's sections at publish time.
- Snapshots are retained indefinitely for version history (no automatic
  deletion).

### Repository Owner

`PageSnapshotRepository` — owns the `PageSnapshot` aggregate root. Snapshots
are queried by `pageId` and `revisionNumber`.

### Lifecycle

- Created (at publish time) → Retained indefinitely
- No mutations after creation. No deletion.

### Transaction Boundary

Single `PageSnapshot` row (with embedded section/SEO data as JSON). One
transaction. The publish operation that creates the snapshot is a separate
transaction from the page status mutation — they are coordinated by the use
case, not by a cross-aggregate transaction.

---

## 9. SectionType Aggregate

### Aggregate Root

`SectionType`

### Child Entities

None.

### Value Objects

- `AuditTrail`
- `propsSchema` (opaque JSON schema value object)

### Invariants

- SectionType key is unique across the platform.
- `version` follows semver.
- A system SectionType (`isSystem = true`) cannot be deleted.
- Unregistering a SectionType that has active sections on pages produces a
  warning (`SectionTypeUninstallPolicy`); orphaned sections are flagged but
  not auto-deleted.

### Consistency Rules

- `SectionTypeVersionPolicy`: new versions must be backward-compatible with
  the current version's schema (if not, a migration path is required).

### Repository Owner

`SectionTypeRepository` / `SectionTypeRegistry` — owns the `SectionType`
aggregate root. Platform-global scope. The registry is a read-optimized
facade over the repository.

### Lifecycle

- Registered → Active → Inactive
- Inactive section types remain in the registry for historical reference but
  cannot be placed on new pages.

### Transaction Boundary

Single `SectionType` row. One transaction.

---

## 10. Media Aggregate

### Aggregate Root

`Media`

### Child Entities

None. `Folder` is a separate aggregate root (see below).

### Value Objects

- `AuditTrail`
- `metadata` (opaque EXIF/duration value object)

### Invariants

- A media asset always belongs to exactly one `Website`.
- `url` is the canonical storage URL; it is set at upload time and immutable.
- `mimeType` is immutable after creation (changing MIME type would
  invalidate the stored file).
- `sizeBytes` is immutable after creation (the file content does not change).

### Consistency Rules

- `folderId` (if set) must reference a folder in the same website.
- Alt text can be updated post-upload (`AltTextPolicy` warns if empty).
- Soft-delete marks the metadata record; a background job purges the storage
  object after the retention window.

### Repository Owner

`MediaRepository` — owns the `Media` aggregate root.

### Lifecycle

- Uploaded → Active → Archived (soft-deleted) → Purged (background job
  removes storage object after retention)

### Transaction Boundary

Single `Media` row. One transaction. The storage object upload is a separate
operation coordinated by the use case — metadata persistence and file
storage are not in the same database transaction.

---

## 11. Folder Aggregate

### Aggregate Root

`Folder`

### Child Entities

None. Folders form a tree via `parentId` references (by ID, not object
references).

### Value Objects

- `AuditTrail`

### Invariants

- A folder always belongs to exactly one `Website`.
- `parentId` (if set) must reference a folder in the same website.
- Folder name is unique within the parent folder (per website).
- No circular references in the folder tree.

### Consistency Rules

- Deleting a folder with media items: media items are moved to the parent
  folder (or root), not deleted with the folder.

### Repository Owner

`FolderRepository` — owns the `Folder` aggregate root.

### Lifecycle

- Created → Active → Deleted (hard-deleted after media is re-parented)

### Transaction Boundary

Single `Folder` row. Re-parenting media on folder deletion is a separate
transaction (cross-aggregate; coordinated by the use case).

---

## 12. Form Aggregate

### Aggregate Root

`Form`

### Child Entities

- `FormField` — field definitions are child entities of the Form root. Fields
  are loaded, ordered, and mutated through the form root.

### Value Objects

- `AuditTrail`
- `FormFieldOption` — option within a field
- `FormFieldValidation` — validation constraints
- `FormNotifications` — notification routing
- `FormSpamProtection` — anti-spam configuration

### Invariants

- A form always belongs to exactly one `Website`.
- Form key is unique within a website.
- Field keys are unique within a form.
- `fields` array order reflects display order — no gaps in `sortOrder`.
- `FormFieldsPolicy`: field count must not exceed plan limit (checked at use
  case level).

### Consistency Rules

- Field types are immutable after creation (changing type would invalidate
  existing submissions).
- Notifications email addresses are validated format-wise.

### Repository Owner

`FormRepository` — owns the `Form` aggregate root (including `FormField`
child entities).

### Lifecycle

- Created → Active → Archived
- Archiving a form stops accepting new submissions but retains existing
  submissions.

### Transaction Boundary

`Form` row + all `FormField` rows for that form. One transaction. Adding,
removing, or reordering fields is atomic with the form mutation.

---

## 13. Submission Aggregate

### Aggregate Root

`Submission`

### Child Entities

None.

### Value Objects

- `AuditTrail`
- `SubmissionSource` — where the form was submitted from
- `SubmissionMeta` — visitor metadata (IP hash, user agent, timestamp)
- `values` — the submitted data (immutable after creation)

### Invariants

- A submission always belongs to exactly one `Form`.
- `values` are **immutable after creation** — submissions are append-only.
  Only the `status` field can change (new → read → replied → archived →
  spam).
- `submittedAt` is set at creation and never changes.

### Consistency Rules

- Status transitions follow a state machine: new → read, new → spam,
  read → replied, read → archived, replied → archived. Transitions are
  one-directional (no un-archiving).
- Hard-deleting a submission (GDPR right-to-be-forgotten) removes the row
  entirely — no soft-delete for erasure requests.

### Repository Owner

`SubmissionRepository` — owns the `Submission` aggregate root. Queried by
`formId` and `websiteId`.

### Lifecycle

- New → Read → Replied → Archived
- New → Spam (alternative path)
- Hard-deleted (on explicit erasure request)

### Transaction Boundary

Single `Submission` row. One transaction. Status updates are atomic single-
row mutations.

---

## 14. Theme Aggregate

### Aggregate Root

`Theme`

### Child Entities

None.

### Value Objects

- `AuditTrail`
- `ThemeTokens` — serializable design-token block

### Invariants

- Theme key is unique within an organization.
- System themes (`isSystem = true`) cannot be deleted or modified.
- `supportedSectionTypes` must reference active `SectionType` keys
  (`ThemeDependencyPolicy`).

### Consistency Rules

- A theme's `supportedSectionTypes` must be a subset of the platform's
  registered section types.
- Changing a theme's tokens does not affect already-published page snapshots
  (snapshots serialize section data, not theme state).

### Repository Owner

`ThemeRepository` — owns the `Theme` aggregate root.

### Lifecycle

- Created → Active → Inactive
- System themes are always active.

### Transaction Boundary

Single `Theme` row (with embedded `tokens` and `supportedSectionTypes`).
One transaction.

---

## 15. Navigation Aggregate

### Aggregate Root

`Navigation`

### Child Entities

- `MenuItem` — menu items are child entities of the Navigation root. Items
  are loaded, ordered, and mutated through the navigation root. Nested
  children are value-object-like trees within the root.

### Value Objects

- `AuditTrail`
- `MenuTarget` — discriminated target (page, URL, media, section)

### Invariants

- A navigation menu always belongs to exactly one `Website`.
- Navigation key is unique within a website (e.g. "header", "footer").
- `MenuItem` IDs are unique within the navigation.
- No circular parent-child references in nested menu items.

### Consistency Rules

- `MenuTarget` of kind "page" references a page slug in the same website
  (validated at use case level, not enforced by the aggregate — the page
  may be archived after the menu item is created).
- `MenuTarget` of kind "media" references a media ID in the same website.

### Repository Owner

`NavigationRepository` — owns the `Navigation` aggregate root (including
`MenuItem` child entities).

### Lifecycle

- Created → Active → Deleted
- Navigation menus are deleted with the website (cascade by use case, not by
  database foreign key).

### Transaction Boundary

Single `Navigation` row + its `items` array (stored as JSON or as child rows
depending on persistence strategy — but always within one transaction).

---

## 16. SEO Aggregate

### Aggregate Root

`SEOProfile`

### Child Entities

None. `SchemaProfile` is a separate aggregate root (see below).

### Value Objects

- `AuditTrail`
- Locale overrides (value object within the profile)

### Invariants

- A `SEOProfile` belongs to exactly one `Website`. If `pageId` is set, the
  profile is page-scoped; if null, it is website-wide defaults.
- Only one `SEOProfile` per page (or one website-default profile).
- `ogImageMediaId` (if set) must reference a media asset in the same website.

### Consistency Rules

- `canonicalUrl` uniqueness across pages is advisory
  (`CanonicalUrlPolicy` warns on duplicates).
- `noindex` / `nofollow` flags are advisory — they control rendering output,
  not aggregate state transitions.

### Repository Owner

`SEORepository` — owns the `SEOProfile` aggregate root.

### Lifecycle

- Created → Active → Deleted (with the page or website)

### Transaction Boundary

Single `SEOProfile` row. One transaction.

---

## 17. SchemaProfile Aggregate

### Aggregate Root

`SchemaProfile`

### Child Entities

None.

### Value Objects

- `AuditTrail`
- `payload` (JSON-LD template value object)

### Invariants

- `SchemaProfile` key is unique within a website.
- `schemaType` is a valid Schema.org type string.
- `pageIds` must reference pages in the same website (validated at use case
  level; empty array = site-wide).

### Consistency Rules

- `SchemaValidPolicy`: the JSON-LD payload must be well-formed.

### Repository Owner

`SchemaProfileRepository` — owns the `SchemaProfile` aggregate root.

### Lifecycle

- Created → Active → Deleted

### Transaction Boundary

Single `SchemaProfile` row. One transaction.

---

## 18. AnalyticsProfile Aggregate

### Aggregate Root

`AnalyticsProfile`

### Child Entities

None.

### Value Objects

- `AuditTrail`
- `config` (opaque provider config value object)

### Invariants

- One `AnalyticsProfile` per website per provider.
- `provider` must be a valid `AnalyticsProvider` enum value.
- `config` contains credential references (SecretRef), never raw secrets.

### Consistency Rules

- Only one provider can be active per website at a time (if the business
  rule requires exclusivity — otherwise multiple are allowed).
- `AnalyticsSummary`, `MetricSeries`, and `MetricPoint` are **read models**
  (projections), not aggregates. They are not persisted as domain state;
  they are computed from event streams or external analytics APIs.

### Repository Owner

`AnalyticsProfileRepository` — owns the `AnalyticsProfile` aggregate root.
Read models (`AnalyticsSummary`) are served by query services or projections,
not by the aggregate repository.

### Lifecycle

- Created → Active → Inactive

### Transaction Boundary

Single `AnalyticsProfile` row. One transaction.

---

## 19. ExportJob Aggregate

### Aggregate Root

`ExportJob`

### Child Entities

None.

### Value Objects

- `AuditTrail`
- `ExportScope` — discriminated union (full_site, pages, published_only)

### Invariants

- An export job always belongs to exactly one `Website` and one
  `Organization`.
- `progress` is between 0 and 1.
- Status transitions follow a state machine: pending → queued → processing →
  completed/failed/canceled. Completed jobs may transition to expired.
- `downloadUrl` is set only when `status === "completed"`.

### Consistency Rules

- `ConcurrentExportPolicy`: an org may not exceed its concurrent export limit
  (checked at use case level before creating a new job).
- `ExportSizePolicy`: warns if estimated size exceeds threshold.
- `ExportRetentionPolicy`: completed job outputs are purged after the
  retention period; the job record is retained.

### Repository Owner

`ExportJobRepository` — owns the `ExportJob` aggregate root.

### Lifecycle

- Pending → Queued → Processing → Completed → Expired
- Pending → Queued → Processing → Failed
- Pending → Queued → Canceled (user-initiated)

### Transaction Boundary

Single `ExportJob` row. One transaction. The actual export work (file
generation) is asynchronous and does not hold a database transaction open.
Progress updates are individual transactions (status + progress field).

---

## 20. Plugin Aggregate

### Aggregate Root

`Plugin`

### Classification

Platform-global record managed outside tenant aggregates. A Plugin is a
platform-level entity, not scoped to any Organization or Website. It
describes a third-party capability package. Plugins are mutable aggregate
roots — their `isActive` flag and metadata can change, so they carry
`version: AggregateVersion`.

### Child Entities

None.

### Value Objects

- `AuditTrail`
- `PluginManifest` — declarative manifest validated at registration
- `PluginContribution` — discriminated union of contribution kinds

### Invariants

- Plugin key is unique across the platform.
- `releaseVersion` follows semver.
- A plugin's `requiresFeatures` must reference valid Feature keys.
- `requiresPlatformVersion` must be satisfied by the current platform version.

### Consistency Rules

- Contributions reference valid section type keys, form field type keys,
  theme keys, or analytics provider keys.
- Unregistering a plugin with active installations produces a warning;
  orphaned installations are flagged but not auto-deleted.

### Repository Owner

`PluginRepository` — owns the `Plugin` aggregate root. Platform-global scope.

### Lifecycle

- Registered → Active → Inactive
- Inactive plugins remain for historical reference but cannot be installed
  on new organizations.

### Transaction Boundary

Single `Plugin` row. One transaction.

---

## 21. PluginInstallation Aggregate

### Aggregate Root

`PluginInstallation`

### Classification

Mutable aggregate root. A PluginInstallation binds a Plugin to an
Organization with per-org configuration. It is mutable (status transitions:
installed → enabled → disabled → uninstalled), so it carries
`version: AggregateVersion`.

### Child Entities

None.

### Value Objects

- `AuditTrail`
- `config` (opaque per-org configuration value object)

### Invariants

- A PluginInstallation always belongs to exactly one `Organization` and
  references exactly one `Plugin`.
- One installation per (organizationId, pluginId) pair.

### Consistency Rules

- The referenced Plugin must be active.
- The organization's plan must include all features in the plugin's
  `requiresFeatures` (checked at use case level by
  `PluginEntitlementPolicy`).

### Repository Owner

`PluginInstallationRepository` — owns the `PluginInstallation` aggregate
root. Scoped to an organization.

### Lifecycle

- Installed → Enabled → Disabled → Uninstalled
- Uninstalled installations are retained for audit.

### Transaction Boundary

Single `PluginInstallation` row. One transaction.

---

## Summary Table

| # | Aggregate Root | Context | Children | Repository | Tx Boundary |
|---|---|---|---|---|---|
| 1 | Organization | Organization | — | OrganizationRepository | Org + overrides |
| 2 | Plan | Organization | — | PlanRepository | Plan + entitlements |
| 3 | Feature | Organization | — | FeatureRepository | Feature row |
| 4 | User | Users | — | UserRepository | User row |
| 5 | Membership | Users | — | MembershipRepository | Membership row |
| 6 | Website | Website | WebsiteSettings | WebsiteRepository | Website + settings |
| 7 | Page | Page | Section | PageRepository | Page + all sections |
| 8 | PageSnapshot | Page | — | PageSnapshotRepository | Snapshot row |
| 9 | SectionType | Section | — | SectionTypeRepository | SectionType row |
| 10 | Media | Media | — | MediaRepository | Media row |
| 11 | Folder | Media | — | FolderRepository | Folder row |
| 12 | Form | Forms | FormField | FormRepository | Form + all fields |
| 13 | Submission | Forms | — | SubmissionRepository | Submission row |
| 14 | Theme | Theme | — | ThemeRepository | Theme row |
| 15 | Navigation | Navigation | MenuItem | NavigationRepository | Navigation + items |
| 16 | SEOProfile | SEO | — | SEORepository | SEOProfile row |
| 17 | SchemaProfile | SEO | — | SchemaProfileRepository | SchemaProfile row |
| 18 | AnalyticsProfile | Analytics | — | AnalyticsProfileRepository | AnalyticsProfile row |
| 19 | ExportJob | Export | — | ExportJobRepository | ExportJob row |
| 20 | Plugin | Plugin | — | PluginRepository | Plugin row |
| 21 | PluginInstallation | Plugin | — | PluginInstallationRepository | PluginInstallation row |

**21 aggregate roots across 14 bounded contexts.** 4 aggregates have child
entities (Website, Page, Form, Navigation). The remaining 15 are single-entity
aggregates with value objects.
