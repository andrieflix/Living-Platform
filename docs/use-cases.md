# Living Sites — Application Use Case Catalog

> **Status:** Architecture only. No implementation in this milestone.

## Purpose

This document is the **master catalog of every business operation** in the
Living Sites platform. Living Sites is not CRUD software. Every capability is
expressed as a business use case. Repositories exist only to support use cases.
Infrastructure exists only to support use cases. The UI exists only to invoke
use cases.

## How to read this catalog

Each bounded context lists its use cases across nine dimensions:

| Dimension | Meaning |
|---|---|
| **Commands** | Operations that mutate state. Every mutation originates here. |
| **Queries** | Operations that read state. Queries never mutate. |
| **Long-running Operations** | Multi-step flows that span more than one request (publish, export, import). |
| **Background Jobs** | Scheduled or queued work that executes without a user waiting. |
| **Events Produced** | Domain events emitted when a use case completes successfully. |
| **Events Consumed** | Domain events from other contexts that trigger work in this context. |
| **External Dependencies** | Infrastructure providers or external services the use cases rely on. |
| **Authorization Requirements** | Who may invoke each use case, expressed as role/permission. |
| **Future Extension Points** | Where plugins, future features, or new variants attach. |

## Use Case Naming Convention

Use cases are named as **verb + noun** in present tense:
`CreateOrganization`, `PublishPage`, `SubmitForm`, `StartExportJob`.

Commands return `Result<T, DomainError>`. Queries return read models
(DTOs), not entities. Long-running operations return a job/operation handle.
Background jobs execute use cases internally — they are not separate logic.

---

## 1. Organization

### Commands

| Use Case | Description | Authorization |
|---|---|---|
| `CreateOrganization` | Provision a new organization with a default plan and owner membership. | Platform admin (first org) or any authenticated user (self-signup). |
| `UpdateOrganization` | Change org name, branding, or settings. | Org `owner` or `admin`. |
| `InviteMember` | Send an invitation to join the org with a specified role. | Org `owner` or `admin`. |
| `AcceptInvitation` | Accept a pending invitation, creating a membership. | Invitee (authenticated, token-verified). |
| `RevokeInvitation` | Cancel a pending invitation. | Org `owner` or `admin`. |
| `RemoveMember` | Remove a member from the org. | Org `owner` (cannot remove self if sole owner). |
| `ChangeMemberRole` | Change a member's role within the org. | Org `owner` only. |
| `UpdatePlan` | Upgrade or downgrade the org's plan. | Org `owner` or platform admin. |
| `ArchiveOrganization` | Soft-delete an org and all its websites. | Org `owner` or platform admin. |

### Queries

| Use Case | Description | Authorization |
|---|---|---|
| `GetOrganization` | Fetch org details by id. | Org member (any role). |
| `ListOrganizations` | List orgs the current user belongs to. | Authenticated user. |
| `ListMembers` | List members of an org with roles. | Org member (any role). |
| `ListPendingInvitations` | List outstanding invitations for an org. | Org `owner` or `admin`. |
| `GetPlanUsage` | Fetch current plan limits vs. usage (websites, pages, storage). | Org `owner` or `admin`. |

### Long-running Operations

None. Organization provisioning is synchronous.

### Background Jobs

| Job | Description | Trigger |
|---|---|---|
| `PurgeArchivedOrganization` | Hard-delete an org after the retention window expires. | Scheduled (daily). |

### Events Produced

| Event | When |
|---|---|
| `OrganizationCreated` | After `CreateOrganization` succeeds. |
| `OrganizationUpdated` | After `UpdateOrganization` succeeds. |
| `OrganizationArchived` | After `ArchiveOrganization` succeeds. |
| `MemberInvited` | After `InviteMember` succeeds. |
| `MemberAdded` | After `AcceptInvitation` succeeds. |
| `MemberRemoved` | After `RemoveMember` succeeds. |
| `MemberRoleChanged` | After `ChangeMemberRole` succeeds. |
| `PlanChanged` | After `UpdatePlan` succeeds. |

### Events Consumed

None. Organization is a root context; it does not react to other contexts.

### External Dependencies

- Database provider (org, membership, invitation, plan data).
- Email provider (invitation emails).

### Authorization Requirements

- Org `owner` has all permissions.
- Org `admin` can manage members and settings but cannot change plan or
  delete the org.
- Org `member` can view org info and list members.

### Future Extension Points

- **SSO providers.** `AcceptInvitation` may gain SSO-based join paths.
- **Org-level feature flags.** `UpdatePlan` may trigger org-scoped flag
  re-evaluation.
- **Custom roles.** Beyond owner/admin/member, a future role-editor could
  define custom permission bundles.

---

## 2. Website

### Commands

| Use Case | Description | Authorization |
|---|---|---|
| `CreateWebsite` | Provision a new website under an org, with default theme and navigation. | Org `owner` or `admin`. |
| `UpdateWebsite` | Change website name, description, or settings. | Website `editor` or higher. |
| `UpdateWebsiteSettings` | Change locale, timezone, custom domain, or favicon. | Website `admin` or org `admin`. |
| `AssignCustomDomain` | Map a custom domain to a website. | Org `owner` or `admin`. |
| `RemoveCustomDomain` | Unmap a custom domain. | Org `owner` or `admin`. |
| `UpdateNavigation` | Reorder or edit nav items for the website. | Website `editor` or higher. |
| `UpdateTheme` | Change the active theme or theme variables for the website. | Website `editor` or higher. |
| `ArchiveWebsite` | Soft-delete a website. | Org `owner` or `admin`. |
| `RestoreWebsite` | Restore an archived website within the retention window. | Org `owner` or `admin`. |

### Queries

| Use Case | Description | Authorization |
|---|---|---|
| `GetWebsite` | Fetch website details by id. | Website member (any role). |
| `ListWebsites` | List websites in an org. | Org member (any role). |
| `GetWebsiteSettings` | Fetch website settings (locale, domain, favicon). | Website member (any role). |
| `GetNavigation` | Fetch the website's navigation tree. | Website member (any role) or public (published nav). |
| `GetTheme` | Fetch the active theme and variables. | Website member (any role). |

### Long-running Operations

None. Website provisioning is synchronous (default theme + nav are created
in the same transaction).

### Background Jobs

| Job | Description | Trigger |
|---|---|---|
| `PurgeArchivedWebsite` | Hard-delete a website after retention window. | Scheduled (daily). |
| `VerifyCustomDomain` | Check DNS records for an assigned custom domain. | Scheduled (periodic) or on-demand. |

### Events Produced

| Event | When |
|---|---|
| `WebsiteCreated` | After `CreateWebsite` succeeds. |
| `WebsiteUpdated` | After `UpdateWebsite` succeeds. |
| `WebsiteArchived` | After `ArchiveWebsite` succeeds. |
| `WebsiteRestored` | After `RestoreWebsite` succeeds. |
| `CustomDomainAssigned` | After `AssignCustomDomain` succeeds. |
| `CustomDomainRemoved` | After `RemoveCustomDomain` succeeds. |
| `NavigationUpdated` | After `UpdateNavigation` succeeds. |
| `ThemeUpdated` | After `UpdateTheme` succeeds. |

### Events Consumed

| Event | Reaction |
|---|---|
| `OrganizationArchived` | Cascade-archive all websites in the org. |

### External Dependencies

- Database provider (website, settings, navigation, theme data).
- DNS verification service (custom domain checks).

### Authorization Requirements

- Org `owner`/`admin` can create, archive, restore, and manage domains.
- Website `admin` can change settings.
- Website `editor` can update navigation and theme.
- Website `viewer` can read.

### Future Extension Points

- **Multi-domain.** A website may support multiple custom domains with
  per-domain redirects.
- **Theme marketplace.** `UpdateTheme` may install themes from a registry.
- **Staging environment.** A website may have a staging clone for
  pre-production testing.

---

## 3. Content (Page + Section)

### Commands

| Use Case | Description | Authorization |
|---|---|---|
| `CreatePage` | Create a new page under a website with slug, title, and optional parent. | Website `editor` or higher. |
| `UpdatePageContent` | Change page title, description, or section order. | Website `editor` or higher. |
| `MoveSection` | Reorder a section within a page. | Website `editor` or higher. |
| `AddSection` | Add a new section to a page from a SectionType. | Website `editor` or higher. |
| `UpdateSection` | Change a section's props (validated against SectionType schema). | Website `editor` or higher. |
| `RemoveSection` | Remove a section from a page. | Website `editor` or higher. |
| `SetHomepage` | Designate a page as the website homepage. | Website `admin` or org `admin`. |
| `ArchivePage` | Soft-delete a page. | Website `editor` or higher. |
| `RestorePage` | Restore an archived page. | Website `editor` or higher. |

### Queries

| Use Case | Description | Authorization |
|---|---|---|
| `GetPage` | Fetch a page with its sections (draft state). | Website member (any role). |
| `ListPages` | List pages in a website, filtered by status. | Website member (any role). |
| `GetPageTree` | Fetch the page hierarchy (parent/child). | Website member (any role). |
| `GetSection` | Fetch a single section with resolved props. | Website member (any role). |
| `ListSectionTypes` | List available SectionTypes (platform + plugin). | Website member (any role). |
| `GetPublishedPage` | Fetch a published page snapshot for rendering. | Public (no auth). |

### Long-running Operations

| Operation | Description |
|---|---|
| `PublishPage` | Create an immutable snapshot of the page and mark it published. Involves: validate all sections, freeze section props, create `PageSnapshot`, update page status, emit event. |
| `SchedulePublish` | Schedule `PublishPage` for a future time. |
| `UnpublishPage` | Revert page to draft, remove from public rendering. |
| `RestoreSnapshot` | Create a new snapshot from an old one (rollback). |

### Background Jobs

| Job | Description | Trigger |
|---|---|---|
| `ExecuteScheduledPublish` | Run `PublishPage` for pages whose scheduled time has arrived. | Scheduled (minute). |
| `PurgeArchivedPages` | Hard-delete archived pages past retention. | Scheduled (daily). |

### Events Produced

| Event | When |
|---|---|
| `PageCreated` | After `CreatePage` succeeds. |
| `PageContentUpdated` | After `UpdatePageContent` succeeds. |
| `PagePublished` | After `PublishPage` succeeds. |
| `PageUnpublished` | After `UnpublishPage` succeeds. |
| `PageScheduled` | After `SchedulePublish` succeeds. |
| `PageArchived` | After `ArchivePage` succeeds. |
| `PageRestored` | After `RestorePage` succeeds. |
| `SectionAdded` | After `AddSection` succeeds. |
| `SectionUpdated` | After `UpdateSection` succeeds. |
| `SectionRemoved` | After `RemoveSection` succeeds. |
| `SnapshotRestored` | After `RestoreSnapshot` succeeds. |

### Events Consumed

| Event | Reaction |
|---|---|
| `WebsiteArchived` | Cascade-archive all pages in the website. |
| `SectionTypeUninstalled` | Mark sections of that type as orphaned (render fallback). |

### External Dependencies

- Database provider (page, section, snapshot data).
- SectionType registry (schema validation).

### Authorization Requirements

- Website `editor`+ can create, update, archive, and restore pages.
- Website `admin`+ can set homepage and publish.
- Public users can read `GetPublishedPage` only.

### Future Extension Points

- **Page templates.** `CreatePage` may accept a template id to pre-populate
  sections.
- **Collaborative editing.** `UpdateSection` may gain real-time conflict
  detection via the builder context.
- **Scheduled unpublish.** A future `ScheduleUnpublish` operation.
- **Page-level SEO overrides.** `UpdatePageContent` may accept SEO fields
  that override website-level SEO.

---

## 4. Builder

### Commands

| Use Case | Description | Authorization |
|---|---|---|
| `StartBuilderSession` | Open a builder session for a page (optimistic editing context). | Website `editor` or higher. |
| `EndBuilderSession` | Close a builder session, releasing locks. | Session owner. |
| `BatchUpdateSections` | Apply multiple section updates atomically within a session. | Session owner. |
| `PreviewChanges` | Render a preview of the current session's uncommitted state. | Session owner. |
| `CommitChanges` | Persist all pending changes from the session to the draft page. | Session owner. |
| `DiscardChanges` | Discard all pending changes and close the session. | Session owner. |

### Queries

| Use Case | Description | Authorization |
|---|---|---|
| `GetBuilderSession` | Fetch the current session state (pending changes, conflicts). | Session owner. |
| `ListActiveSessions` | List active builder sessions for a page (collaboration awareness). | Website member (any role). |
| `DetectConflicts` | Check for conflicting edits from other sessions on the same page. | Session owner. |

### Long-running Operations

None. Builder operations are interactive and synchronous within a session.

### Background Jobs

| Job | Description | Trigger |
|---|---|---|
| `ExpireStaleSessions` | Close builder sessions that have been inactive beyond a timeout. | Scheduled (minute). |

### Events Produced

| Event | When |
|---|---|
| `BuilderSessionStarted` | After `StartBuilderSession` succeeds. |
| `BuilderSessionEnded` | After `EndBuilderSession` succeeds. |
| `BuilderChangesCommitted` | After `CommitChanges` succeeds. |
| `BuilderChangesDiscarded` | After `DiscardChanges` succeeds. |
| `BuilderConflictDetected` | After `DetectConflicts` finds a conflict. |

### Events Consumed

| Event | Reaction |
|---|---|
| `PagePublished` | Invalidate any active builder sessions for that page (draft changed). |
| `PageArchived` | Force-close builder sessions for that page. |

### External Dependencies

- Database provider (page/section draft state).
- Rendering service (preview).
- Realtime channel provider (collaboration awareness).

### Authorization Requirements

- Only the session owner can modify within their session.
- Website `editor`+ can start a session.

### Future Extension Points

- **Real-time collaboration.** Multiple concurrent sessions on the same page
  with CRDT or OT-based merge.
- **Undo/redo stack.** Session-level undo history.
- **AI-assisted layout.** `BatchUpdateSections` may accept AI-generated
  section arrangements.

---

## 5. Media

### Commands

| Use Case | Description | Authorization |
|---|---|---|
| `UploadMedia` | Upload a media file, store it, and create a media record. | Website `editor` or higher. |
| `UpdateMediaMetadata` | Change alt text, caption, or tags on a media item. | Website `editor` or higher. |
| `MoveMediaToFolder` | Move a media item to a different folder. | Website `editor` or higher. |
| `DeleteMedia` | Soft-delete a media item (storage object marked for deletion). | Website `admin` or higher. |
| `CreateFolder` | Create a media folder. | Website `editor` or higher. |
| `UpdateFolder` | Rename or move a folder. | Website `editor` or higher. |
| `DeleteFolder` | Delete a folder (moves items to root or deletes with folder). | Website `admin` or higher. |

### Queries

| Use Case | Description | Authorization |
|---|---|---|
| `GetMedia` | Fetch a single media item with metadata. | Website member (any role). |
| `ListMedia` | List media items in a website, optionally filtered by folder. | Website member (any role). |
| `ListFolders` | List the folder tree for a website. | Website member (any role). |
| `GetMediaUrl` | Get a presigned URL for a media item (time-limited). | Website member (any role) or public (published media). |

### Long-running Operations

| Operation | Description |
|---|---|
| `ProcessUpload` | After upload: generate thumbnails, extract metadata (dimensions, duration), transcode video if needed. Spans upload completion to processing completion. |

### Background Jobs

| Job | Description | Trigger |
|---|---|---|
| `GenerateThumbnails` | Create thumbnail variants for an uploaded image. | After `UploadMedia` completes. |
| `TranscodeVideo` | Transcode uploaded video to web-compatible formats. | After `UploadMedia` completes (video only). |
| `PurgeDeletedMedia` | Hard-delete storage objects for soft-deleted media past retention. | Scheduled (daily). |

### Events Produced

| Event | When |
|---|---|
| `MediaUploaded` | After `UploadMedia` succeeds. |
| `MediaMetadataUpdated` | After `UpdateMediaMetadata` succeeds. |
| `MediaDeleted` | After `DeleteMedia` succeeds. |
| `MediaProcessed` | After `ProcessUpload` (thumbnails, transcoding) completes. |
| `FolderCreated` | After `CreateFolder` succeeds. |
| `FolderUpdated` | After `UpdateFolder` succeeds. |
| `FolderDeleted` | After `DeleteFolder` succeeds. |

### Events Consumed

| Event | Reaction |
|---|---|
| `WebsiteArchived` | Cascade-soft-delete all media in the website. |

### External Dependencies

- Storage provider (file storage, presigned URLs).
- Database provider (media records, folders).
- Image processing service (thumbnail generation, metadata extraction).
- Video transcoding service (video only).

### Authorization Requirements

- Website `editor`+ can upload, update metadata, move, and create folders.
- Website `admin`+ can delete media and folders.

### Future Extension Points

- **CDN integration.** `GetMediaUrl` may serve from a CDN with cache
  invalidation on update.
- **AI alt-text generation.** `UpdateMediaMetadata` may auto-suggest alt text.
- **Drag-and-drop folder organization.** Bulk move operations.
- **Media search.** Full-text search across alt text, captions, tags.

---

## 6. SEO

### Commands

| Use Case | Description | Authorization |
|---|---|---|
| `UpdateSEOProfile` | Set website-level SEO defaults (meta, Open Graph, Twitter cards). | Website `editor` or higher. |
| `UpdatePageSEO` | Override SEO settings for a specific page. | Website `editor` or higher. |
| `UpdateRobotsPolicy` | Set robots.txt rules for the website. | Website `admin` or higher. |
| `UpdateSchemaProfile` | Set structured data (JSON-LD) defaults for the website. | Website `editor` or higher. |
| `SubmitToSearchEngines` | Notify Google/Bing of a sitemap update. | Website `admin` or higher. |

### Queries

| Use Case | Description | Authorization |
|---|---|---|
| `GetSEOProfile` | Fetch website-level SEO settings. | Website member (any role). |
| `GetPageSEO` | Fetch page-level SEO overrides. | Website member (any role). |
| `GetRobotsPolicy` | Fetch the robots.txt rules. | Website member (any role) or public. |
| `GetSchemaProfile` | Fetch structured data settings. | Website member (any role). |
| `GetSitemap` | Generate the XML sitemap for the website. | Public (no auth). |

### Long-running Operations

None. SEO updates are synchronous.

### Background Jobs

| Job | Description | Trigger |
|---|---|---|
| `RegenerateSitemap` | Rebuild the sitemap after content changes. | On `PagePublished` / `PageUnpublished` / `PageArchived`. |
| `PingSearchEngines` | Submit sitemap URL to Google/Bing. | After sitemap regeneration (configurable). |

### Events Produced

| Event | When |
|---|---|
| `SEOProfileUpdated` | After `UpdateSEOProfile` succeeds. |
| `PageSEOUpdated` | After `UpdatePageSEO` succeeds. |
| `RobotsPolicyUpdated` | After `UpdateRobotsPolicy` succeeds. |
| `SchemaProfileUpdated` | After `UpdateSchemaProfile` succeeds. |
| `SitemapRegenerated` | After `RegenerateSitemap` succeeds. |

### Events Consumed

| Event | Reaction |
|---|---|
| `PagePublished` | Trigger `RegenerateSitemap`. |
| `PageUnpublished` | Trigger `RegenerateSitemap`. |
| `PageArchived` | Trigger `RegenerateSitemap`. |
| `CustomDomainAssigned` | Update sitemap base URL. |

### External Dependencies

- Database provider (SEO profile, page SEO, robots, schema data).
- Search engine ping APIs (Google, Bing).

### Authorization Requirements

- Website `editor`+ can update SEO profiles and page SEO.
- Website `admin`+ can update robots policy and submit to search engines.

### Future Extension Points

- **Page-level schema overrides.** Beyond website-level schema, per-page
  JSON-LD.
- **Redirect manager.** A future `CreateRedirect` use case for 301/302 rules.
- **SEO scoring.** An analysis query that scores a page's SEO health.
- **Multi-domain sitemaps.** Separate sitemaps per custom domain.

---

## 7. Analytics

### Commands

| Use Case | Description | Authorization |
|---|---|---|
| `UpdateAnalyticsProfile` | Configure the analytics provider for a website (provider, tracking id, settings). | Website `admin` or higher. |
| `EnableAnalytics` | Turn analytics tracking on for a website. | Website `admin` or higher. |
| `DisableAnalytics` | Turn analytics tracking off for a website. | Website `admin` or higher. |
| `FlushMetrics` | Force-flush buffered analytics events to the provider. | Website `admin` or platform admin. |

### Queries

| Use Case | Description | Authorization |
|---|---|---|
| `GetAnalyticsProfile` | Fetch the analytics configuration for a website. | Website member (any role). |
| `GetMetrics` | Fetch traffic metrics (pageviews, visitors, sources) for a date range. | Website `editor` or higher. |
| `GetPageMetrics` | Fetch per-page metrics for a date range. | Website `editor` or higher. |
| `GetTrafficSources` | Fetch traffic source breakdown. | Website `editor` or higher. |

### Long-running Operations

None. Analytics queries proxy to the analytics provider synchronously
(with caching).

### Background Jobs

| Job | Description | Trigger |
|---|---|---|
| `SyncMetrics` | Pull metrics from the analytics provider into a local cache for faster queries. | Scheduled (hourly). |
| `FlushEventBuffer` | Flush buffered analytics events to the provider. | Scheduled (every N minutes). |

### Events Produced

| Event | When |
|---|---|
| `AnalyticsProfileUpdated` | After `UpdateAnalyticsProfile` succeeds. |
| `AnalyticsEnabled` | After `EnableAnalytics` succeeds. |
| `AnalyticsDisabled` | After `DisableAnalytics` succeeds. |

### Events Consumed

| Event | Reaction |
|---|---|
| `WebsiteArchived` | Disable analytics and stop syncing metrics. |
| `PagePublished` | Register the page URL with the analytics provider (if supported). |

### External Dependencies

- Analytics provider SDK (Google Analytics, Plausible, Fathom).
- Database provider (analytics profile, cached metrics).

### Authorization Requirements

- Website `admin`+ can configure and enable/disable analytics.
- Website `editor`+ can view metrics.

### Future Extension Points

- **Custom dashboards.** Saved metric views with date ranges and comparisons.
- **Goal/conversion tracking.** Define and track conversion events.
- **Real-time analytics.** Live visitor counts via WebSocket/SSE.
- **Multi-provider.** Send events to multiple analytics providers simultaneously.

- **AI alt-text generation.** `UpdateMediaMetadata` may auto-suggest alt text.
- **Drag-and-drop folder organization.** Bulk move operations.
- **Media search.** Full-text search across alt text, captions, tags.

---

## 8. Forms

### Commands

| Use Case | Description | Authorization |
|---|---|---|
| `CreateForm` | Create a form with a field specification. | Website `editor` or higher. |
| `UpdateForm` | Change form fields, settings, or notification config. | Website `editor` or higher. |
| `DeleteForm` | Soft-delete a form. | Website `admin` or higher. |
| `SubmitForm` | Accept a form submission from a visitor (public). | Public (no auth). |
| `UpdateSubmissionStatus` | Change submission status (e.g. read, flagged, archived). | Website `editor` or higher. |
| `DeleteSubmission` | Hard-delete a submission (GDPR/right-to-be-forgotten). | Website `admin` or higher. |

### Queries

| Use Case | Description | Authorization |
|---|---|---|
| `GetForm` | Fetch a form definition with fields. | Website member (any role). |
| `ListForms` | List forms in a website. | Website member (any role). |
| `GetSubmission` | Fetch a single submission. | Website `editor` or higher. |
| `ListSubmissions` | List submissions for a form, filtered by status and date. | Website `editor` or higher. |
| `ExportSubmissions` | Generate a CSV/JSON export of submissions. | Website `editor` or higher. |

### Long-running Operations

None. Form submission is synchronous (spam check, persist, notify).

### Background Jobs

| Job | Description | Trigger |
|---|---|---|
| `SendFormNotification` | Email the form owner about a new submission. | After `SubmitForm` succeeds. |
| `PurgeOldSubmissions` | Delete submissions past the configured retention. | Scheduled (daily). |

### Events Produced

| Event | When |
|---|---|
| `FormCreated` | After `CreateForm` succeeds. |
| `FormUpdated` | After `UpdateForm` succeeds. |
| `FormDeleted` | After `DeleteForm` succeeds. |
| `FormSubmitted` | After `SubmitForm` succeeds. |
| `SubmissionStatusUpdated` | After `UpdateSubmissionStatus` succeeds. |

### Events Consumed

| Event | Reaction |
|---|---|
| `WebsiteArchived` | Stop accepting submissions for forms in the website. |
| `PagePublished` | If the page contains a form section, ensure the form is active. |

### External Dependencies

- Database provider (form definitions, submissions).
- Email provider (notification emails).
- Spam screening service (Akismet, reCAPTCHA, or built-in heuristics).

### Authorization Requirements

- Website `editor`+ can create and update forms.
- Website `admin`+ can delete forms and submissions.
- Public users can submit forms (no auth).

### Future Extension Points

- **Conditional fields.** Form fields that show/hide based on other field
  values.
- **Multi-step forms.** Forms split across multiple pages/steps.
- **Webhooks.** Fire a webhook on `FormSubmitted` for integration.
- **File upload fields.** Form submissions that include file uploads via
  the media pipeline.
- **CRM integration.** Forward submissions to a CRM (HubSpot, Salesforce).

---

## 9. Export

### Commands

| Use Case | Description | Authorization |
|---|---|---|
| `StartExportJob` | Begin an export of a website (full, partial, or single page) in a specified format. | Website `admin` or higher. |
| `CancelExportJob` | Cancel a running export job. | Website `admin` or higher. |
| `DeleteExportJob` | Delete a completed export job and its output. | Website `admin` or higher. |

### Queries

| Use Case | Description | Authorization |
|---|---|---|
| `GetExportJob` | Fetch the status and metadata of an export job. | Website `admin` or higher. |
| `ListExportJobs` | List export jobs for a website. | Website `admin` or higher. |
| `DownloadExport` | Get a presigned URL to download the export output. | Website `admin` or higher. |

### Long-running Operations

| Operation | Description |
|---|---|
| `ExecuteExport` | The actual export process: gather published snapshots, render to the target format (HTML, ZIP, PDF, JSON), upload to storage, mark job complete. Spans from job start to output availability. |

### Background Jobs

| Job | Description | Trigger |
|---|---|---|
| `ExecuteExportJob` | Run `ExecuteExport` for a queued export job. | On `StartExportJob` (queued). |
| `PurgeOldExports` | Delete export outputs past the configured retention. | Scheduled (daily). |
| `RetryFailedExport` | Retry an export job that failed due to a transient error. | Scheduled (periodic). |

### Events Produced

| Event | When |
|---|---|
| `ExportJobStarted` | After `StartExportJob` succeeds. |
| `ExportJobCompleted` | After `ExecuteExport` succeeds. |
| `ExportJobFailed` | After `ExecuteExport` fails. |
| `ExportJobCancelled` | After `CancelExportJob` succeeds. |

### Events Consumed

None. Export reads from content and rendering contexts but does not react to
events.

### External Dependencies

- Database provider (export job records).
- Storage provider (export output files).
- Rendering service (render pages to target format).
- Queue provider (job scheduling).

### Authorization Requirements

- Website `admin`+ can start, cancel, list, and download exports.

### Future Extension Points

- **Scheduled exports.** Automatically export on a recurring schedule.
- **Import.** A future `StartImportJob` use case for importing content from
  an export file or external source.
- **Custom export templates.** User-defined templates for HTML exports.
- **Multi-site export.** Export all websites in an org as a bundle.

---

## 10. Plugins

### Commands

| Use Case | Description | Authorization |
|---|---|---|
| `RegisterPlugin` | Register a plugin manifest with the platform (platform-global). | Platform admin. |
| `UnregisterPlugin` | Remove a plugin from the platform registry. | Platform admin. |
| `InstallPlugin` | Install a plugin for an organization. | Org `owner` or `admin`. |
| `UninstallPlugin` | Uninstall a plugin from an org (renders fallbacks for its content). | Org `owner` or `admin`. |
| `EnablePlugin` | Enable an installed plugin for an org. | Org `owner` or `admin`. |
| `DisablePlugin` | Disable an installed plugin (preserves content, renders fallbacks). | Org `owner` or `admin`. |
| `UpdatePluginConfig` | Change org-level configuration for an installed plugin. | Org `owner` or `admin`. |

### Queries

| Use Case | Description | Authorization |
|---|---|---|
| `ListAvailablePlugins` | List all registered plugins (platform-global catalog). | Authenticated user. |
| `GetPlugin` | Fetch a plugin manifest and metadata. | Authenticated user. |
| `ListInstalledPlugins` | List plugins installed in an org with status. | Org member (any role). |
| `GetPluginConfig` | Fetch org-level config for an installed plugin. | Org `owner` or `admin`. |

### Long-running Operations

| Operation | Description |
|---|---|
| `RunPluginMigration` | Execute a plugin's data migration on install/upgrade. Spans migration script execution. |

### Background Jobs

| Job | Description | Trigger |
|---|---|---|
| `RunPluginMigrationJob` | Execute `RunPluginMigration` in the background. | On `InstallPlugin` or plugin upgrade. |
| `CleanupUninstalledPlugin` | Remove plugin data after uninstall and retention window. | Scheduled (daily). |

### Events Produced

| Event | When |
|---|---|
| `PluginRegistered` | After `RegisterPlugin` succeeds. |
| `PluginUnregistered` | After `UnregisterPlugin` succeeds. |
| `PluginInstalled` | After `InstallPlugin` succeeds. |
| `PluginUninstalled` | After `UninstallPlugin` succeeds. |
| `PluginEnabled` | After `EnablePlugin` succeeds. |
| `PluginDisabled` | After `DisablePlugin` succeeds. |
| `PluginConfigUpdated` | After `UpdatePluginConfig` succeeds. |

### Events Consumed

| Event | Reaction |
|---|---|
| `OrganizationArchived` | Disable all plugins installed in the org. |

### External Dependencies

- Database provider (plugin registry, installation records, config).
- Plugin sandbox runtime (future: isolated execution of plugin code).

### Authorization Requirements

- Platform admin can register/unregister plugins globally.
- Org `owner`/`admin` can install, uninstall, enable, disable, and configure
  plugins for their org.
- Org members can view installed plugins.

### Future Extension Points

- **Plugin marketplace.** Browse and install plugins from a centralized
  registry.
- **Per-website plugin scoping.** Enable a plugin for specific websites
  within an org.
- **Plugin webhooks.** Plugins can subscribe to domain events.
- **Plugin-contributed use cases.** Plugins extend the use case catalog with
  new operations.

---

## 11. Identity (Users)

### Commands

| Use Case | Description | Authorization |
|---|---|---|
| `RegisterUser` | Create a new user account (email + password). | Public (no auth). |
| `UpdateProfile` | Change the current user's display name, avatar, or preferences. | Authenticated user (self only). |
| `ChangePassword` | Change the current user's password. | Authenticated user (self only). |
| `RequestPasswordReset` | Send a password reset email. | Public (no auth). |
| `ResetPassword` | Set a new password using a reset token. | Token-verified (no auth). |
| `DeleteAccount` | Soft-delete the user account. | Authenticated user (self only). |

### Queries

| Use Case | Description | Authorization |
|---|---|---|
| `GetCurrentUser` | Fetch the authenticated user's profile. | Authenticated user. |
| `GetUser` | Fetch a user's public profile by id. | Org member (same org). |
| `ListUsers` | List users in an org (by membership). | Org `owner` or `admin`. |

### Long-running Operations

None. Identity operations are synchronous.

### Background Jobs

| Job | Description | Trigger |
|---|---|---|
| `PurgeDeletedAccounts` | Hard-delete soft-deleted accounts past retention. | Scheduled (daily). |
| `SendPasswordResetEmail` | Send the reset email (async to avoid blocking the request). | On `RequestPasswordReset`. |

### Events Produced

| Event | When |
|---|---|
| `UserRegistered` | After `RegisterUser` succeeds. |
| `ProfileUpdated` | After `UpdateProfile` succeeds. |
| `PasswordChanged` | After `ChangePassword` succeeds. |
| `PasswordReset` | After `ResetPassword` succeeds. |
| `AccountDeleted` | After `DeleteAccount` succeeds. |

### Events Consumed

| Event | Reaction |
|---|---|
| `MemberRemoved` | If the user has no remaining memberships, prompt account deletion. |

### External Dependencies

- Auth provider (Supabase Auth — user accounts, password hashing, reset
  tokens).
- Email provider (reset emails, welcome emails).
- Database provider (user profile data).

### Authorization Requirements

- Users can manage only their own profile and password.
- Org `owner`/`admin` can list users in their org (by membership).
- Platform admin can manage any account.

### Future Extension Points

- **SSO / OAuth.** `RegisterUser` may gain Google/GitHub/Microsoft login.
- **MFA.** Multi-factor authentication as an additional verification step.
- **Sessions management.** View and revoke active sessions.
- **Account merging.** Merge duplicate accounts.

---

## 12. Platform (System)

### Commands

| Use Case | Description | Authorization |
|---|---|---|
| `CreatePlan` | Define a new subscription plan. | Platform admin. |
| `UpdatePlan` | Change plan limits or pricing. | Platform admin. |
| `ArchivePlan` | Retire a plan (existing orgs keep it; no new signups). | Platform admin. |
| `CreateFeature` | Define a new feature flag key. | Platform admin. |
| `UpdateFeature` | Change feature availability or rules. | Platform admin. |
| `RegisterSectionType` | Register a platform-global SectionType. | Platform admin. |
| `UnregisterSectionType` | Retire a SectionType (existing sections render fallback). | Platform admin. |
| `CreateSystemTheme` | Register a platform-global theme. | Platform admin. |
| `UpdateSystemTheme` | Update a system theme. | Platform admin. |

### Queries

| Use Case | Description | Authorization |
|---|---|---|
| `ListPlans` | List all available plans. | Public (no auth). |
| `GetPlan` | Fetch plan details. | Public (no auth). |
| `ListFeatures` | List all platform features. | Platform admin. |
| `ListSectionTypes` | List all platform SectionTypes. | Authenticated user. |
| `ListSystemThemes` | List all system themes. | Authenticated user. |
| `GetPlatformHealth` | Fetch platform health status (liveness + readiness). | Platform admin. |

### Long-running Operations

None. Platform management operations are synchronous.

### Background Jobs

| Job | Description | Trigger |
|---|---|---|
| `PlatformHealthCheck` | Evaluate all registered health checks. | Scheduled (frequent). |

### Events Produced

| Event | When |
|---|---|
| `PlanCreated` | After `CreatePlan` succeeds. |
| `PlanUpdated` | After `UpdatePlan` succeeds. |
| `PlanArchived` | After `ArchivePlan` succeeds. |
| `FeatureCreated` | After `CreateFeature` succeeds. |
| `FeatureUpdated` | After `UpdateFeature` succeeds. |
| `SectionTypeRegistered` | After `RegisterSectionType` succeeds. |
| `SectionTypeUnregistered` | After `UnregisterSectionType` succeeds. |
| `SystemThemeCreated` | After `CreateSystemTheme` succeeds. |
| `SystemThemeUpdated` | After `UpdateSystemTheme` succeeds. |

### Events Consumed

None. Platform is a root context; it does not react to other contexts.

### External Dependencies

- Database provider (plans, features, section types, themes).
- Health registry (platform health checks).

### Authorization Requirements

- Platform admin only for all mutation operations.
- Public/authenticated users can read catalogs (plans, section types, themes).

### Future Extension Points

- **Plan trials.** Time-limited access to a plan's features.
- **Feature gating rules.** Complex rules for feature availability (by org
  size, region, plan).
- **SectionType versioning.** Versioned schemas with migration paths.
- **Theme inheritance.** System themes that can be extended by org themes.

---

## Summary Table

| Context | Commands | Queries | Long-running | Background Jobs | Events Produced |
|---|---|---|---|---|---|
| Organization | 9 | 5 | 0 | 1 | 8 |
| Website | 9 | 5 | 0 | 2 | 8 |
| Content | 9 | 6 | 4 | 2 | 11 |
| Builder | 6 | 3 | 0 | 1 | 5 |
| Media | 7 | 4 | 1 | 3 | 7 |
| SEO | 5 | 5 | 0 | 2 | 5 |
| Analytics | 4 | 4 | 0 | 2 | 3 |
| Forms | 6 | 5 | 0 | 2 | 5 |
| Export | 3 | 3 | 1 | 3 | 4 |
| Plugins | 7 | 4 | 1 | 2 | 7 |
| Identity | 6 | 3 | 0 | 2 | 5 |
| Platform | 9 | 6 | 0 | 1 | 9 |
| **Total** | **80** | **53** | **7** | **23** | **77** |

80 commands, 53 queries, 7 long-running operations, 23 background jobs, and
77 domain events across 12 bounded contexts.
