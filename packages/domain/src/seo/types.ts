/**
 * SEO bounded context — search-engine optimization profiles and structured data.
 *
 * SEOProfile is attached per-Page (and per-Website as defaults). SchemaProfile
 * defines JSON-LD structured-data blocks to emit in rendered pages.
 */
import type {
  PageId,
  WebsiteId,
  MediaId,
  Slug,
  LocaleCode,
  MachineKey,
  AuditTrail,
  AggregateVersion,
} from "../shared";

/** Page- or website-level SEO configuration. */
export interface SEOProfile {
  readonly id: string;
  readonly websiteId: WebsiteId;
  /** Page id if this profile is page-scoped; null if website defaults. */
  readonly pageId: PageId | null;
  title?: string;
  description?: string;
  /** Canonical URL override; null = derived from page slug. */
  canonicalUrl?: string;
  /** Whether to emit a noindex directive. */
  noindex: boolean;
  /** Whether to emit a nofollow directive. */
  nofollow: boolean;
  /** Open Graph image media reference. */
  ogImageMediaId?: MediaId;
  /** Twitter card type. */
  twitterCard?: "summary" | "summary_large_image" | "player" | "app";
  /** Per-locale title/description overrides. */
  localeOverrides?: Readonly<Record<LocaleCode, { title?: string; description?: string }>>;
  /** Optimistic concurrency version. Monotonically incremented on each save. */
  version: AggregateVersion;
  readonly audit: AuditTrail;
}

/** A named JSON-LD structured-data profile applied to pages. */
export interface SchemaProfile {
  readonly id: string;
  readonly websiteId: WebsiteId;
  readonly key: MachineKey;
  name: string;
  /** Schema.org type, e.g. "Organization", "LocalBusiness", "Article". */
  schemaType: string;
  /** The JSON-LD payload template with placeholders. */
  payload: Readonly<Record<string, unknown>>;
  /** Pages this profile is attached to; empty = applies to whole site. */
  pageIds: readonly PageId[];
  /** Optimistic concurrency version. Monotonically incremented on each save. */
  version: AggregateVersion;
  readonly audit: AuditTrail;
}

/** Sitemap entry derived from published pages + SEO profiles. */
export interface SitemapEntry {
  readonly url: string;
  readonly lastModified: string;
  readonly changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  readonly priority: number;
}

/** robots.txt directive set for a website. */
export interface RobotsPolicy {
  readonly websiteId: WebsiteId;
  rules: readonly RobotsRule[];
  sitemapUrl?: string;
}

export interface RobotsRule {
  userAgent: string;
  allow: readonly string[];
  disallow: readonly string[];
}

/** Convenience re-export so consumers can import Slug from this context. */
export type { Slug };
