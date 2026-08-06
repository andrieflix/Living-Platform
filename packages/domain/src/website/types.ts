/**
 * Website bounded context — a single publishable site owned by an Organization.
 *
 * Invariant: a Website always belongs to exactly one Organization.
 * A Website owns Pages, Media, Forms, and its own Settings.
 *
 * Navigation and Theme were split into their own bounded contexts
 * (./navigation, ./theme) but remain re-exported here for compatibility.
 */
import type {
  WebsiteId,
  OrganizationId,
  ThemeId,
  Slug,
  LocaleCode,
  AuditTrail,
  VersionString,
  AggregateVersion,
} from "../shared";

/** A website within an organization. */
export interface Website {
  readonly id: WebsiteId;
  readonly organizationId: OrganizationId;
  readonly slug: Slug;
  /** Display name, e.g. "Tajon Construction — Marketing Site". */
  name: string;
  /** Primary public hostname, e.g. "tajonconstruction.com". */
  customDomain?: string;
  /** Platform-provided fallback hostname, e.g. "tajon.livingsites.app". */
  fallbackDomain: string;
  status: WebsiteStatus;
  /** Current published version; null until first publish. */
  publishedVersion: VersionString | null;
  /** Active theme reference. */
  themeId: ThemeId;
  /** Default locale for content authoring and rendering. */
  defaultLocale: LocaleCode;
  /** All locales enabled on this website. */
  enabledLocales: readonly LocaleCode[];
  /** Optimistic concurrency version. Monotonically incremented on each save. */
  version: AggregateVersion;
  readonly audit: AuditTrail;
}

/** Website-scoped configuration that is not content. */
export interface WebsiteSettings {
  readonly websiteId: WebsiteId;
  /** Whether the site is protected by a shared password. */
  passwordProtection: { enabled: boolean; passwordHash?: string } | null;
  /** Whether indexing by search engines is allowed. */
  searchEngineIndexing: boolean;
  /** Open Graph / social share defaults. */
  socialDefaults: {
    defaultShareTitle?: string;
    defaultShareDescription?: string;
    defaultShareMediaId?: string;
  };
  /** Header/footer script injections (verified admin-only). */
  headerScripts: readonly string[];
  footerScripts: readonly string[];
  /** Favicon media reference. */
  faviconMediaId?: string;
  readonly audit: AuditTrail;
}

export enum WebsiteStatus {
  Draft = "draft",
  Published = "published",
  Unpublished = "unpublished",
  Archived = "archived",
}
