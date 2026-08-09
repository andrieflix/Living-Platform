/**
 * Events bounded context — domain event vocabulary.
 *
 * Reserved for future development. Defines the contracts for domain events
 * only. No event bus, no dispatcher, no runtime machinery — those are
 * infrastructure concerns for a future milestone.
 */
import type { OrganizationId, WebsiteId, PageId, MediaId, FormId, SubmissionId, ExportJobId, UserId, ISODateString, VersionString } from "../shared";
/**
 * Explicit scope for a domain event. Replaces the previous nullable
 * `organizationId` field with a clear, exhaustive type.
 *
 * - `platform`: Event is not scoped to any organization (e.g. user registration).
 * - `organization`: Event is scoped to an organization.
 * - `website`: Event is scoped to a specific website within an organization.
 */
export type EventScope = {
    readonly scope: "platform";
} | {
    readonly scope: "organization";
    readonly organizationId: OrganizationId;
} | {
    readonly scope: "website";
    readonly organizationId: OrganizationId;
    readonly websiteId: WebsiteId;
};
/** Base shape every domain event implements. */
export interface DomainEvent {
    /** Event type key, e.g. "page.published". */
    readonly type: string;
    /** When the event occurred (domain time, not delivery time). */
    readonly occurredAt: ISODateString;
    /** Explicit event scope. */
    readonly eventScope: EventScope;
}
export interface OrganizationCreatedEvent extends DomainEvent {
    readonly type: "organization.created";
    readonly eventScope: {
        readonly scope: "organization";
        readonly organizationId: OrganizationId;
    };
    readonly slug: string;
    readonly planId: string | null;
}
export interface WebsiteCreatedEvent extends DomainEvent {
    readonly type: "website.created";
    readonly eventScope: {
        readonly scope: "website";
        readonly organizationId: OrganizationId;
        readonly websiteId: WebsiteId;
    };
    readonly slug: string;
}
export interface WebsitePublishedEvent extends DomainEvent {
    readonly type: "website.published";
    readonly eventScope: {
        readonly scope: "website";
        readonly organizationId: OrganizationId;
        readonly websiteId: WebsiteId;
    };
    readonly publishedVersion: VersionString;
}
export interface PagePublishedEvent extends DomainEvent {
    readonly type: "page.published";
    readonly eventScope: {
        readonly scope: "website";
        readonly organizationId: OrganizationId;
        readonly websiteId: WebsiteId;
    };
    readonly pageId: PageId;
    readonly snapshotId: string;
    readonly version: VersionString;
}
export interface PageArchivedEvent extends DomainEvent {
    readonly type: "page.archived";
    readonly eventScope: {
        readonly scope: "website";
        readonly organizationId: OrganizationId;
        readonly websiteId: WebsiteId;
    };
    readonly pageId: PageId;
}
export interface MediaUploadedEvent extends DomainEvent {
    readonly type: "media.uploaded";
    readonly eventScope: {
        readonly scope: "organization";
        readonly organizationId: OrganizationId;
    };
    readonly mediaId: MediaId;
    readonly mimeType: string;
    readonly sizeBytes: number;
}
export interface FormSubmittedEvent extends DomainEvent {
    readonly type: "form.submitted";
    readonly eventScope: {
        readonly scope: "website";
        readonly organizationId: OrganizationId;
        readonly websiteId: WebsiteId;
    };
    readonly submissionId: SubmissionId;
    readonly formId: FormId;
}
export interface FeatureEnabledEvent extends DomainEvent {
    readonly type: "feature.enabled";
    readonly eventScope: {
        readonly scope: "organization";
        readonly organizationId: OrganizationId;
    };
    readonly featureKey: string;
    readonly value: number;
}
export interface PluginInstalledEvent extends DomainEvent {
    readonly type: "plugin.installed";
    readonly eventScope: {
        readonly scope: "organization";
        readonly organizationId: OrganizationId;
    };
    readonly pluginId: string;
}
export interface ExportCompletedEvent extends DomainEvent {
    readonly type: "export.completed";
    readonly eventScope: {
        readonly scope: "organization";
        readonly organizationId: OrganizationId;
    };
    readonly jobId: ExportJobId;
    readonly downloadUrl: string;
    readonly pagesCount: number;
}
export interface UserRegisteredEvent extends DomainEvent {
    readonly type: "user.registered";
    readonly eventScope: {
        readonly scope: "platform";
    };
    readonly userId: UserId;
    readonly email: string;
    readonly displayName: string;
}
export interface EmailVerifiedEvent extends DomainEvent {
    readonly type: "user.email_verified";
    readonly eventScope: {
        readonly scope: "platform";
    };
    readonly userId: UserId;
    readonly email: string;
}
/** Union of all known domain events for exhaustive handling. */
export type KnownDomainEvent = OrganizationCreatedEvent | WebsiteCreatedEvent | WebsitePublishedEvent | PagePublishedEvent | PageArchivedEvent | MediaUploadedEvent | FormSubmittedEvent | FeatureEnabledEvent | PluginInstalledEvent | ExportCompletedEvent | UserRegisteredEvent | EmailVerifiedEvent;
//# sourceMappingURL=index.d.ts.map