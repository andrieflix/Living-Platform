/**
 * Cross-context service contracts that orchestrate across multiple bounded
 * contexts (page + section + media + seo + theme). BuilderService drives the
 * authoring surface; RenderingService drives the public render pipeline.
 */
import type {
  Result,
  DomainError,
  WebsiteId,
  PageId,
  SectionId,
  Page,
  Section,
  BuilderCanvas,
  RenderedPage,
} from "@livingsites/domain";

export interface BuilderService {
  loadCanvas(pageId: PageId): Promise<Result<BuilderCanvas, DomainError>>;

  addSection(input: {
    pageId: PageId;
    sectionTypeKey: string;
    insertAfterSectionId?: SectionId | null;
    props?: Record<string, unknown>;
  }): Promise<Result<{ page: Page; section: Section }, DomainError>>;

  updateSection(
    sectionId: SectionId,
    props: Record<string, unknown>,
  ): Promise<Result<Section, DomainError>>;

  removeSection(sectionId: SectionId): Promise<Result<Page, DomainError>>;

  moveSection(
    sectionId: SectionId,
    target: { pageId: PageId; insertAfterSectionId?: SectionId | null },
  ): Promise<Result<{ page: Page; section: Section }, DomainError>>;

  duplicateSection(sectionId: SectionId): Promise<Result<Section, DomainError>>;
}

export interface RenderingService {
  renderPage(input: {
    websiteId: WebsiteId;
    pageId: PageId;
    locale?: string;
    preview?: boolean;
  }): Promise<Result<RenderedPage, DomainError>>;

  renderSite(websiteId: WebsiteId): Promise<Result<readonly RenderedPage[], DomainError>>;
}

export type { RenderedPage, BuilderCanvas };
