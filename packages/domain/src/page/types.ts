/**
 * Page bounded context — a single addressable route within a Website.
 *
 * Invariant: a Page always belongs to exactly one Website.
 * A Page is composed of an ordered list of Section instances.
 */
import type {
  PageId,
  WebsiteId,
  SectionId,
  Slug,
  LocaleCode,
  ISODateString,
  AuditTrail,
  LifecycleStatus,
  AggregateVersion,
} from "../shared";

/** A single page within a website. */
export interface Page {
  readonly id: PageId;
  readonly websiteId: WebsiteId;
  /** URL slug relative to the website root, e.g. "about" or "services/remodel". */
  readonly slug: Slug;
  title: string;
  /** Optional page-level description used for SEO if no SEOProfile override. */
  description?: string;
  /** Whether this is the site's homepage (one per website). */
  isHomepage: boolean;
  status: PageStatus;
  /** Published snapshot id, or null if never published. */
  publishedSnapshotId: string | null;
  /** Ordered section ids rendering top-to-bottom. */
  sectionOrder: readonly SectionId[];
  /** Locales this page has been translated into beyond the default. */
  availableLocales: readonly LocaleCode[];
  /** Parent page id for nested routes; null at root. */
  parentId: PageId | null;
  /** Optimistic concurrency version. Monotonically incremented on each save. */
  version: AggregateVersion;
  readonly audit: AuditTrail;
}

/**
 * Immutable snapshot of a page at publish time.
 *
 * PageSnapshot does NOT carry an `AggregateVersion` — it is never mutated
 * after creation. Publication history is tracked via `revisionNumber`, which
 * is immutable, increases monotonically per Page, and is unique per pageId.
 *
 * Snapshot identity and uniqueness are based on the dedicated snapshot ID
 * plus a unique (pageId, revisionNumber) constraint.
 *
 * An optional human-facing release label may use `releaseVersion` (a
 * VersionString), separate from the machine-managed `revisionNumber`.
 */
export interface PageSnapshot {
  readonly id: string;
  readonly pageId: PageId;
  /** Immutable, monotonically increasing revision number per Page. */
  readonly revisionNumber: number;
  /** Optional human-facing release label, e.g. "1.0.0". */
  readonly releaseVersion?: import("../shared").VersionString;
  readonly publishedAt: ISODateString;
  readonly publishedBy?: string;
  /** Serialized section tree at publish time. Opaque to the domain core. */
  readonly sections: readonly SectionSnapshotEntry[];
  readonly seo?: SeoSnapshot;
}

export interface SectionSnapshotEntry {
  readonly sectionId: SectionId;
  readonly sectionTypeId: string;
  readonly props: Readonly<Record<string, unknown>>;
  readonly sortOrder: number;
}

export interface SeoSnapshot {
  readonly title?: string;
  readonly description?: string;
  readonly canonicalUrl?: string;
  readonly noindex: boolean;
  readonly ogImageMediaId?: string;
}

export enum PageStatus {
  Draft = "draft",
  Published = "published",
  Scheduled = "scheduled",
  Archived = "archived",
}

/** A type alias so LifecycleStatus is referenced (pages use PageStatus). */
export type { LifecycleStatus };
