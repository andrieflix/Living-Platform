import type {
  SEOProfile,
  SchemaProfile,
  SitemapEntry,
  WebsiteId,
  PageId,
  Result,
  DomainError,
} from "@livingsites/domain";

/** Flattened, render-ready SEO metadata. */
export interface ResolvedSEO {
  title: string;
  description: string;
  canonicalUrl: string;
  noindex: boolean;
  nofollow: boolean;
  ogImageMediaId?: string;
  twitterCard?: "summary" | "summary_large_image" | "player" | "app";
  jsonLd: readonly Record<string, unknown>[];
}

export interface SEOService {
  upsertPageProfile(
    pageId: PageId,
    profile: Omit<SEOProfile, "id" | "websiteId" | "pageId" | "audit">,
  ): Promise<Result<SEOProfile, DomainError>>;

  upsertWebsiteDefaults(
    websiteId: WebsiteId,
    profile: Omit<SEOProfile, "id" | "websiteId" | "pageId" | "audit">,
  ): Promise<Result<SEOProfile, DomainError>>;

  resolveForPage(pageId: PageId, locale?: string): Promise<Result<ResolvedSEO, DomainError>>;

  generateSitemap(websiteId: WebsiteId): Promise<Result<readonly SitemapEntry[], DomainError>>;
  generateRobots(websiteId: WebsiteId): Promise<Result<string, DomainError>>;

  attachSchema(pageId: PageId, schemaKey: string): Promise<Result<SchemaProfile, DomainError>>;
  detachSchema(pageId: PageId, schemaKey: string): Promise<Result<void, DomainError>>;
}
