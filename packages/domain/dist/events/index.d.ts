/**
 * Events bounded context — domain event vocabulary.
 *
 * Reserved for future development. Defines the contracts for domain events
 * only. No event bus, no dispatcher, no runtime machinery — those are
 * infrastructure concerns for a future milestone.
 */
import type { OrganizationId, WebsiteId, PageId, MediaId, FormId, SubmissionId, ExportJobId, UserId, ISODateString, VersionString } from "../shared";
/** Base shape every domain event implements. */
export interface DomainEvent {
    /** Event type key, e.g. "page.published". */
    readonly type: string;
    /** When the event occurred (domain time, not delivery time). */
    readonly occurredAt: ISODateString;
    /** The organization the event is scoped to. Null for platform-level events (e.g. user events). */
    readonly organizationId: OrganizationId | null;
    /** Optional: the website the event is scoped to. */
    readonly websiteId?: WebsiteId;
}
export interface OrganizationCreatedEvent extends DomainEvent {
    readonly type: "organization.created";
    readonly organizationId: OrganizationId;
    readonly slug: string;
    readonly planId: string | null;
}
export interface WebsiteCreatedEvent extends DomainEvent {
    readonly type: "website.created";
    readonly websiteId: WebsiteId;
    readonly slug: string;
}
export interface WebsitePublishedEvent extends DomainEvent {
    readonly type: "website.published";
    readonly websiteId: WebsiteId;
    readonly publishedVersion: VersionString;
}
export interface PagePublishedEvent extends DomainEvent {
    readonly type: "page.published";
    readonly pageId: PageId;
    readonly snapshotId: string;
    readonly version: VersionString;
}
export interface PageArchivedEvent extends DomainEvent {
    readonly type: "page.archived";
    readonly pageId: PageId;
}
export interface MediaUploadedEvent extends DomainEvent {
    readonly type: "media.uploaded";
    readonly mediaId: MediaId;
    readonly mimeType: string;
    readonly sizeBytes: number;
}
export interface FormSubmittedEvent extends DomainEvent {
    readonly type: "form.submitted";
    readonly submissionId: SubmissionId;
    readonly formId: FormId;
}
export interface FeatureEnabledEvent extends DomainEvent {
    readonly type: "feature.enabled";
    readonly featureKey: string;
    readonly value: number;
}
export interface PluginInstalledEvent extends DomainEvent {
    readonly type: "plugin.installed";
    readonly pluginId: string;
}
export interface ExportCompletedEvent extends DomainEvent {
    readonly type: "export.completed";
    readonly jobId: ExportJobId;
    readonly downloadUrl: string;
    readonly pagesCount: number;
}
export interface UserRegisteredEvent extends DomainEvent {
    readonly type: "user.registered";
    readonly userId: UserId;
    readonly email: string;
    readonly displayName: string;
}
export interface EmailVerifiedEvent extends DomainEvent {
    readonly type: "user.email_verified";
    readonly userId: UserId;
    readonly email: string;
}
/** Union of all known domain events for exhaustive handling. */
export type KnownDomainEvent = OrganizationCreatedEvent | WebsiteCreatedEvent | WebsitePublishedEvent | PagePublishedEvent | PageArchivedEvent | MediaUploadedEvent | FormSubmittedEvent | FeatureEnabledEvent | PluginInstalledEvent | ExportCompletedEvent | UserRegisteredEvent | EmailVerifiedEvent;
//# sourceMappingURL=index.d.ts.map