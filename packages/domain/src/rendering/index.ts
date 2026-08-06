/**
 * Rendering bounded context — public-rendering pipeline domain concepts.
 *
 * Reserved for future development. Owns the rendering vocabulary (rendered
 * output shapes and render context) so it isn't invented in the application
 * layer. The application-layer RenderingService operates on these types.
 */
import type { WebsiteId, PageId, LocaleCode } from "../shared";
import type { ThemeTokens } from "../theme/types";

/** A single rendered page output. */
export interface RenderedPage {
  readonly path: string;
  readonly html: string;
  readonly statusCode: 200 | 301 | 302 | 404 | 410 | 500;
  readonly headers: Readonly<Record<string, string>>;
  readonly jsonLd: readonly Record<string, unknown>[];
}

/** The inputs to a render operation. */
export interface RenderContext {
  readonly websiteId: WebsiteId;
  readonly pageId: PageId;
  readonly locale: LocaleCode;
  readonly themeTokens: ThemeTokens;
  /** Resolved SEO metadata to emit in the document head. */
  readonly seo: {
    title: string;
    description: string;
    canonicalUrl: string;
    noindex: boolean;
    nofollow: boolean;
    ogImageMediaId?: string;
    twitterCard?: "summary" | "summary_large_image" | "player" | "app";
    jsonLd: readonly Record<string, unknown>[];
  };
  /** Whether this is a draft preview (skips snapshot enforcement). */
  readonly preview: boolean;
}

/** Target output format for a render. */
export enum OutputFormat {
  Html = "html",
  StaticHtml = "static_html",
  Pdf = "pdf",
}
