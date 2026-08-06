# Living Sites — Business Policy Catalog

> **Status:** Architecture only. No implementation in this milestone.

## Purpose

This document is the **master catalog of every business policy** in the Living
Sites platform. A policy is a first-class architectural concept that
determines whether an operation is allowed based on business constraints.

Policies are **not** permissions (authorization — who can act). Policies are
**not** feature flags (rollout — what is enabled). Policies are **not**
repositories (data access). Policies are **business rules** evaluated by use
cases before performing an operation.

## What is a Policy?

A **policy** is a reusable, deterministic function that evaluates a business
constraint and returns a decision: allow, deny, or warn.

| Concept | Question it answers | Example |
|---|---|---|
| **Authorization** | Is this *user* allowed to do this? | "Is Alice an admin of this org?" |
| **Feature Flag** | Is this *feature* rolled out? | "Is the builder enabled for this org?" |
| **Policy** | Does *business state* permit this? | "Has this org exceeded its page limit?" |

Policies compose with authorization and feature flags: a use case checks
authorization first (can the user act?), then feature flags (is the capability
available?), then policies (does business state allow this specific action?).

## Policy Categories

Policies are organized by bounded context. Each category lists its policies
with: inputs, evaluation, failure behavior, and future extension points.

---

## 1. Subscription Policies

Subscription policies enforce plan limits and entitlements. They are the
primary commercial guardrails of the platform.

### Policies

| Policy | Inputs | Evaluation | On Failure |
|---|---|---|---|
| `WebsiteCountPolicy` | orgId, plan | Deny if website count >= plan.maxWebsites. | `PlanLimitReached` error with current vs. max. |
| `PageCountPolicy` | websiteId, orgId, plan | Deny if page count for the website's org >= plan.maxPagesPerWebsite. | `PlanLimitReached` error. |
| `StorageQuotaPolicy` | orgId, plan, bytesToAdd | Deny if (currentStorageBytes + bytesToAdd) >= plan.maxStorageBytes. | `StorageQuotaExceeded` error. |
| `MediaCountPolicy` | websiteId, orgId, plan | Deny if media count >= plan.maxMediaItems. | `PlanLimitReached` error. |
| `FormCountPolicy` | websiteId, orgId, plan | Deny if form count >= plan.maxForms. | `PlanLimitReached` error. |
| `SubmissionCountPolicy` | formId, orgId, plan | Deny if submission count for the form >= plan.maxSubmissionsPerForm. | `PlanLimitReached` error. |
| `ExportCountPolicy` | orgId, plan | Deny if active export jobs >= plan.maxConcurrentExports. | `PlanLimitReached` error. |
| `MemberCountPolicy` | orgId, plan | Deny if member count >= plan.maxMembers. | `PlanLimitReached` error. |
| `PluginCountPolicy` | orgId, plan | Deny if installed plugins >= plan.maxPlugins. | `PlanLimitReached` error. |
| `CustomDomainPolicy` | orgId, plan | Deny if custom domains >= plan.maxCustomDomains. | `PlanLimitReached` error. |
| `FeatureEntitlementPolicy` | orgId, plan, featureKey | Deny if the plan does not include the requested feature. | `FeatureNotEntitled` error. |
| `PlanActivePolicy` | orgId, plan | Deny if the org's plan is archived or suspended. | `PlanNotActive` error. |

### Inputs

- `OrganizationId` — which org the operation targets.
- `Plan` — the org's current plan (limits and entitlements).
- `UsageCounts` — current resource counts (websites, pages, media, etc.).
- `bytesToAdd` — for storage policies, the size of the proposed upload.

### Evaluation

All subscription policies are **synchronous and deterministic**. They compare
a current count against a plan limit. No external calls, no side effects.

### Failure

When a subscription policy fails, the use case returns a `DomainError` with
the policy name, current value, and limit. The UI renders an upgrade prompt.

### Future Extension Points

- **Overage policies.** Allow exceeding limits with per-unit billing (usage-
  based pricing).
- **Grace period policies.** Allow a brief grace period after a plan
  downgrade before enforcing new limits.
- **Custom plan policies.** Per-org custom limits negotiated outside the
  standard plan structure.

---

## 2. Website Policies

Website policies govern website lifecycle and configuration constraints.

### Policies

| Policy | Inputs | Evaluation | On Failure |
|---|---|---|---|
| `WebsiteActivePolicy` | websiteId | Deny if the website is archived. | `WebsiteArchived` error. |
| `WebsiteOwnershipPolicy` | websiteId, orgId | Deny if the website does not belong to the specified org. | `WebsiteNotInOrg` error. |
| `SingleHomepagePolicy` | websiteId | Deny if setting a homepage would result in two homepages. | `DuplicateHomepage` error. |
| `CustomDomainAvailabilityPolicy` | orgId, plan, domain | Deny if the domain is already mapped to another website, or if the plan doesn't allow custom domains. | `DomainUnavailable` or `FeatureNotEntitled` error. |
| `DomainFormatPolicy` | domain | Deny if the domain string is malformed or uses a reserved TLD. | `InvalidDomain` error. |
| `WebsiteDeletePolicy` | websiteId | Warn if the website has published pages (data loss risk). | Warning with page count. |
| `ArchiveRetentionPolicy` | websiteId, archivedAt | Deny restore if the retention window has expired. | `RetentionExpired` error. |

### Inputs

- `WebsiteId`, `OrganizationId` — target identifiers.
- `Plan` — for entitlement checks (custom domains).
- `Website` — current website state (status, page count).
- `domain` — the domain string being assigned.

### Evaluation

Website policies are synchronous. They read from the `Website` entity and
plan. No repository access — the use case passes the entity as input.

### Future Extension Points

- **Multi-domain policies.** Policies that govern per-domain redirect rules.
- **Staging policies.** Policies that govern staging environment creation and
  sync frequency.

---

## 3. Publishing Policies

Publishing policies govern the transition from draft to published state. They
are the quality gate for public content.

### Policies

| Policy | Inputs | Evaluation | On Failure |
|---|---|---|---|
| `PageHasContentPolicy` | pageId, sections | Deny if the page has zero sections. | `EmptyPage` error. |
| `SectionValidationPolicy` | sections, sectionTypes | Deny if any section's props fail schema validation against its SectionType. | `InvalidSectionProps` error with field details. |
| `SlugUniquenessPolicy` | websiteId, slug, pageId | Deny if another page in the website uses the same slug. | `DuplicateSlug` error. |
| `HomepageRequiredPolicy` | websiteId, pages | Warn if the website has no homepage set. | Warning. |
| `ScheduledPublishConflictPolicy` | pageId, scheduledAt | Deny if the page already has a scheduled publish at a different time. | `AlreadyScheduled` error. |
| `OrphanedSectionPolicy` | sections, sectionTypes | Warn if any section references an unregistered SectionType (plugin uninstalled). | Warning with section type name. |
| `PublishCooldownPolicy` | pageId, lastPublishedAt | Warn if the page was published less than N seconds ago (rate limiting). | Warning. |
| `SnapshotIntegrityPolicy` | pageId, sections | Deny if the snapshot would be empty or corrupted (all sections failed validation). | `SnapshotInvalid` error. |

### Inputs

- `PageId`, `WebsiteId` — target identifiers.
- `sections` — the page's current sections (with props).
- `sectionTypes` — the SectionType registry entries for validation.
- `lastPublishedAt` — timestamp of the last publish (for cooldown).

### Evaluation

Publishing policies are synchronous and deterministic. `SectionValidationPolicy`
is the most complex — it validates each section's props against the
SectionType schema. The schema validation function is injected by the use
case (from the SectionType registry), not accessed by the policy directly.

### Future Extension Points

- **Pre-publish SEO policy.** Warn if the page is missing meta description or
  Open Graph image.
- **Content policy.** Flag prohibited content (spam, prohibited keywords) —
  may require an external screening service, making it an async policy.
- **Approval workflow policy.** Require a second user's approval before
  publish (enterprise feature).

---

## 4. SEO Policies

SEO policies govern sitemap, robots, and structured data configuration.

### Policies

| Policy | Inputs | Evaluation | On Failure |
|---|---|---|---|
| `RobotsPolicyConflictPolicy` | websiteId, robotsRules | Warn if robots rules would block the entire site (`Disallow: /`). | Warning. |
| `SitemapSizePolicy` | websiteId, pageCount | Warn if the sitemap exceeds 50,000 URLs (search engine limit). Suggest splitting. | Warning. |
| `SchemaValidPolicy` | schemaProfile | Deny if the JSON-LD schema is malformed. | `InvalidSchema` error. |
| `CanonicalUrlPolicy` | pageId, canonicalUrl | Warn if the canonical URL duplicates another page's canonical. | Warning. |
| `MetaDescriptionPolicy` | pageId, seoProfile | Warn if the page is missing a meta description. | Warning. |

### Inputs

- `WebsiteId`, `PageId` — target identifiers.
- `robotsRules` — the proposed robots.txt rules.
- `pageCount` — for sitemap size.
- `schemaProfile` — the JSON-LD configuration.
- `seoProfile` — the SEO settings for a page or website.

### Evaluation

SEO policies are advisory-heavy — many produce warnings rather than hard
denials. The use case decides whether to proceed with warnings or surface them
to the user for confirmation.

### Future Extension Points

- **Redirect loop policy.** Detect circular redirects in a future redirect
  manager.
- **Multi-domain sitemap policy.** Validate sitemap structure across multiple
  custom domains.

---

## 5. Media Policies

Media policies govern upload constraints, processing, and storage.

### Policies

| Policy | Inputs | Evaluation | On Failure |
|---|---|---|---|
| `MediaTypePolicy` | mimeType, plan | Deny if the MIME type is not in the allowed list (plan-scoped or platform-wide). | `UnsupportedMediaType` error. |
| `FileSizePolicy` | fileSize, plan | Deny if the file size exceeds plan.maxFileSize or platform absolute max. | `FileTooLarge` error. |
| `ImageDimensionsPolicy` | width, height, plan | Warn if image dimensions exceed recommended maximums. Deny if below minimum. | Warning or `ImageTooSmall` error. |
| `StorageQuotaPolicy` | orgId, plan, bytesToAdd | Deny if the upload would exceed the org's storage quota. | `StorageQuotaExceeded` error. (Shared with subscription policies.) |
| `DuplicateUploadPolicy` | orgId, fileHash | Warn if a media item with the same hash already exists in the org. | Warning with existing item reference. |
| `DangerousContentPolicy` | mimeType, fileName | Deny if the file extension is dangerous (e.g. .exe, .svg with scripts). | `DangerousFile` error. |
| `AltTextPolicy` | mediaId, altText | Warn if alt text is empty or too short (accessibility). | Warning. |

### Inputs

- `mimeType`, `fileSize`, `width`, `height` — file metadata.
- `fileHash` — content hash for dedup detection.
- `Plan` — for plan-scoped limits.
- `orgId` — for quota and dedup.

### Evaluation

Media policies are evaluated at upload time (before the file is stored) and
at metadata update time (alt text). The `StorageQuotaPolicy` is shared with
subscription policies because it depends on plan limits.

### Future Extension Points

- **Virus scanning policy.** Async policy that waits for a scan result before
  allowing the upload to be public.
- **AI content moderation policy.** Async policy that screens images for
  prohibited content.
- **CDN cache policy.** Policy that determines cache TTL based on media type.

---

## 6. Storage Policies

Storage policies govern the storage layer abstraction — bucket access,
presigned URL TTLs, and object lifecycle.

### Policies

| Policy | Inputs | Evaluation | On Failure |
|---|---|---|---|
| `BucketAccessPolicy` | orgId, bucketPath | Deny if the org does not own the bucket path. | `BucketAccessDenied` error. |
| `PresignedUrlTtlPolicy` | ttl, plan | Deny if the requested TTL exceeds the plan's max presigned URL TTL. | `TtlExceeded` error. |
| `ObjectLifecyclePolicy` | mediaId, mediaStatus, plan | Determine if the object should be purged based on retention rules and plan. | Returns a lifecycle decision (keep/purge/transition). |
| `StorageTierPolicy` | mediaId, plan | Determine the storage tier (hot/warm/cold) based on access frequency and plan. | Returns a tier recommendation. |

### Inputs

- `orgId`, `mediaId` — target identifiers.
- `bucketPath` — the storage path being accessed.
- `ttl` — requested presigned URL time-to-live.
- `Plan` — for plan-scoped limits.

### Evaluation

Storage policies are synchronous. `ObjectLifecyclePolicy` and
`StorageTierPolicy` return decisions rather than allow/deny — they guide
background jobs rather than blocking user operations.

### Future Extension Points

- **Cross-region replication policy.** Determine if an object should be
  replicated to a secondary region.
- **Encryption policy.** Enforce encryption-at-rest requirements per plan.

---

## 7. Export Policies

Export policies govern export job creation, format constraints, and resource
limits.

### Policies

| Policy | Inputs | Evaluation | On Failure |
|---|---|---|---|
| `ExportFormatPolicy` | format, plan | Deny if the export format is not supported by the plan. | `FormatNotSupported` error. |
| `ExportScopePolicy` | scope, websiteId | Deny if the export scope (full/partial/single) is invalid for the website state (e.g. single-page export of a non-existent page). | `InvalidExportScope` error. |
| `ConcurrentExportPolicy` | orgId, plan | Deny if the org already has maxConcurrentExports running. | `ConcurrentExportLimit` error. (Shared with subscription.) |
| `ExportSizePolicy` | websiteId, scope | Warn if the estimated export size exceeds a threshold (large export may take a long time). | Warning. |
| `ExportRetentionPolicy` | jobId, completedAt, plan | Determine if the export output should be purged based on retention. | Returns a lifecycle decision. |

### Inputs

- `format` — the target export format (HTML, ZIP, PDF, JSON).
- `scope` — full, partial, single-page.
- `WebsiteId`, `OrgId` — target identifiers.
- `Plan` — for plan-scoped limits.

### Evaluation

Export policies are synchronous. `ExportSizePolicy` produces a warning — the
use case may proceed but surfaces the estimate to the user.

### Future Extension Points

- **Scheduled export policy.** Validate cron expressions and frequency
  limits for scheduled exports.
- **Export watermarking policy.** Require watermarks on free-plan exports.

---

## 8. Builder Policies

Builder policies govern builder session constraints, concurrency, and edit
safety.

### Policies

| Policy | Inputs | Evaluation | On Failure |
|---|---|---|---|
| `SessionConcurrencyPolicy` | pageId, activeSessions, plan | Deny if the number of active builder sessions for the page exceeds the plan's max concurrent editors. | `TooManyEditors` error. |
| `SessionOwnershipPolicy` | sessionId, userId | Deny if the user does not own the session. | `NotSessionOwner` error. |
| `PageEditablePolicy` | pageId, pageStatus | Deny if the page is archived or being published. | `PageNotEditable` error. |
| `BatchSizePolicy` | batchCount, plan | Deny if a batch update exceeds the max sections per batch. | `BatchTooLarge` error. |
| `ConflictDetectionPolicy` | pageId, sessionChanges, otherSessionChanges | Warn if another session has committed conflicting changes. | Warning with conflict details. |
| `BuilderEntitlementPolicy` | orgId, plan, featureFlag | Deny if the builder feature is not enabled (feature flag) or not entitled (plan). | `FeatureNotEntitled` error. |

### Inputs

- `pageId`, `sessionId`, `userId` — target identifiers.
- `activeSessions` — count of concurrent sessions on the page.
- `pageStatus` — the current page status.
- `Plan` — for concurrency limits.
- `featureFlag` — the builder feature flag evaluation result.

### Evaluation

Builder policies are synchronous. `ConflictDetectionPolicy` is the most
complex — it compares the current session's base state against committed
changes from other sessions. The comparison logic is injected by the use
case.

### Future Extension Points

- **CRDT compatibility policy.** Determine if a section type supports
  conflict-free merging (for real-time collaboration).
- **Auto-save policy.** Determine if auto-save is enabled and the interval.
- **AI-edit policy.** Validate AI-generated section arrangements before
  commit.

---

## 9. Organization Policies

Organization policies govern org lifecycle, membership, and plan changes.

### Policies

| Policy | Inputs | Evaluation | On Failure |
|---|---|---|---|
| `SoleOwnerPolicy` | orgId, members | Deny removing or downgrading the last owner of the org. | `SoleOwnerRemoval` error. |
| `RoleHierarchyPolicy` | currentRole, newRole | Deny if a non-owner tries to assign a role equal to or higher than their own. | `RoleEscalation` error. |
| `InvitationExpiryPolicy` | invitationId, invitedAt | Deny acceptance if the invitation has expired. | `InvitationExpired` error. |
| `PlanDowngradePolicy` | orgId, currentPlan, newPlan | Warn if the new plan's limits are below current usage (websites, pages, storage). | Warning with over-limit details. |
| `ArchiveImpactPolicy` | orgId, websites | Warn if archiving the org will cascade-archive N websites. | Warning with website count. |
| `SelfRemovalPolicy` | orgId, userId, members | Deny if the user is the sole owner (same as SoleOwnerPolicy, specialized). | `SoleOwnerRemoval` error. |

### Inputs

- `orgId`, `userId` — target identifiers.
- `members` — the org's current member list with roles.
- `currentPlan`, `newPlan` — for plan change policies.
- `websites` — for archive impact.

### Evaluation

Organization policies are synchronous and deterministic. They operate on
member lists and plan data passed as inputs by the use case.

### Future Extension Points

- **SSO enrollment policy.** Validate SSO configuration before enabling SSO
  login for an org.
- **Org transfer policy.** Govern transferring org ownership between users.
- **Compliance policy.** Industry-specific compliance constraints (HIPAA,
  GDPR data residency).

---

## 10. Platform Policies

Platform policies govern system-wide constraints: section type registration,
theme management, and plan administration.

### Policies

| Policy | Inputs | Evaluation | On Failure |
|---|---|---|---|
| `SectionTypeUninstallPolicy` | sectionTypeId, websites | Warn if unregistering a SectionType will orphan sections in N websites. | Warning with website count. |
| `SectionTypeVersionPolicy` | sectionTypeId, currentVersion, newVersion | Deny if the new version's schema is not backward-compatible with the current. | `IncompatibleVersion` error. |
| `PlanArchivePolicy` | planId, orgs | Warn if archiving a plan affects N orgs currently on it. | Warning with org count. |
| `ThemeDependencyPolicy` | themeId, sectionTypes | Deny if a theme requires a SectionType that is not registered. | `MissingDependency` error. |
| `PlatformMaintenancePolicy` | maintenanceWindow | Deny if the platform is in a maintenance window and the operation is not exempt. | `MaintenanceMode` error. |

### Inputs

- `sectionTypeId`, `planId`, `themeId` — target identifiers.
- `websites`, `orgs` — impact counts.
- `sectionTypes` — for dependency checks.
- `maintenanceWindow` — the current maintenance schedule.

### Evaluation

Platform policies are synchronous. They are evaluated by platform-admin use
cases (RegisterSectionType, ArchivePlan, etc.) before system-wide changes.

### Future Extension Points

- **Plugin compatibility policy.** Validate plugin compatibility across
  platform versions.
- **Rate limit policy.** Platform-wide rate limiting for API operations.
- **Region policy.** Enforce data residency constraints per region.

---

## 11. Forms Policies

Forms policies govern form creation, submission validation, and spam
prevention.

### Policies

| Policy | Inputs | Evaluation | On Failure |
|---|---|---|---|
| `FormFieldsPolicy` | fields, plan | Deny if the number of fields exceeds plan.maxFieldsPerForm. | `TooManyFields` error. |
| `SubmissionSizePolicy` | submissionBytes, plan | Deny if the submission payload exceeds plan.maxSubmissionSizeBytes. | `SubmissionTooLarge` error. |
| `FormActivePolicy` | formId, formStatus | Deny if the form is not active (deleted or website archived). | `FormNotActive` error. |
| `SpamScorePolicy` | submission, spamScore | Deny if the spam score exceeds plan.spamScoreThreshold. | `SpamDetected` error. |
| `RateLimitPolicy` | formId, ipAddress, windowMs, maxPerWindow | Deny if the IP has submitted more than maxPerWindow times in the window. | `RateLimited` error. |
| `RequiredFieldsPolicy` | fields, submission | Deny if required fields are missing from the submission. | `MissingRequiredField` error. |
| `HoneypotPolicy` | submission, honeypotField | Deny if the honeypot field is filled (bot detection). | `SpamDetected` error. |

### Inputs

- `formId` — target form identifier.
- `fields` — the form's field definitions.
- `submission` — the submitted data.
- `ipAddress` — the submitter's IP (for rate limiting).
- `Plan` — for plan-scoped limits.
- `spamScore` — the spam screening result (from an external service, injected
  by the use case).

### Evaluation

Forms policies are synchronous except `SpamScorePolicy`, which depends on an
external spam screening service. The use case calls the spam service, gets a
score, and passes it to the policy as input. The policy itself is synchronous
— it compares the score against the threshold.

### Future Extension Points

- **CAPTCHA policy.** Require CAPTCHA verification for forms with high spam
  rates.
- **File upload submission policy.** Validate file uploads within form
  submissions against media policies.
- **Consent policy.** Require GDPR consent checkboxes for forms collecting
  personal data.

---

## 12. Future AI Policies

AI policies are reserved for future AI-assisted features. They are documented
here to establish the architectural seam, even though no AI features exist yet.

### Policies

| Policy | Inputs | Evaluation | On Failure |
|---|---|---|---|
| `AIUsageQuotaPolicy` | orgId, plan, aiRequestCount | Deny if the org has exceeded its AI request quota for the billing period. | `AIQuotaExceeded` error. |
| `AIContentPolicy` | generatedContent | Warn if the AI-generated content matches prohibited patterns. | Warning. May escalate to deny in strict mode. |
| `AIModelAccessPolicy` | orgId, plan, modelTier | Deny if the plan does not include access to the requested AI model tier. | `ModelNotAvailable` error. |
| `AIRateLimitPolicy` | orgId, requestsPerMinute | Deny if the org exceeds the AI request rate limit. | `RateLimited` error. |
| `AIOutputValidationPolicy` | generatedContent, sectionType | Deny if AI-generated section props fail schema validation. | `InvalidAIOutput` error. |
| `AISafetyPolicy` | prompt, generatedContent | Deny if the prompt or output violates safety guidelines. | `SafetyViolation` error. |

### Inputs

- `orgId`, `plan` — for quota and entitlement checks.
- `generatedContent` — the AI output to validate.
- `modelTier` — the requested AI model tier (basic, advanced, premium).
- `prompt` — the user's prompt (for safety screening).

### Evaluation

AI policies are a mix of synchronous (quota, rate limit) and potentially
asynchronous (content moderation, safety screening). The architecture
supports both: synchronous policies return a decision immediately;
asynchronous policies return a decision after an injected screening function
completes.

### Future Extension Points

- **AI attribution policy.** Require AI-generated content to be labeled.
- **AI training opt-out policy.** Determine if an org's content can be used
  for AI training.
- **AI model fallback policy.** Determine which model to use when the
  preferred model is unavailable.

---

## Summary Table

| Category | Policies | Deny | Warn | Decision |
|---|---|---|---|---|
| Subscription | 12 | 12 | 0 | 0 |
| Website | 7 | 5 | 2 | 0 |
| Publishing | 8 | 5 | 3 | 0 |
| SEO | 5 | 1 | 4 | 0 |
| Media | 7 | 4 | 3 | 0 |
| Storage | 4 | 2 | 0 | 2 |
| Export | 5 | 2 | 1 | 2 |
| Builder | 6 | 4 | 2 | 0 |
| Organization | 6 | 4 | 2 | 0 |
| Platform | 5 | 2 | 3 | 0 |
| Forms | 7 | 6 | 0 | 1 |
| Future AI | 6 | 4 | 1 | 1 |
| **Total** | **78** | **51** | **21** | **6** |

78 policies across 12 categories. 51 produce hard denials, 21 produce
warnings, and 6 return lifecycle decisions (keep/purge/transition) rather
than allow/deny.
