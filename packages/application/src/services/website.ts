import type {
  Website,
  WebsiteSettings,
  WebsiteId,
  OrganizationId,
  ThemeId,
  Result,
  DomainError,
} from "@livingsites/domain";

export interface WebsiteService {
  createWebsite(input: {
    organizationId: OrganizationId;
    slug: string;
    name: string;
    themeId?: ThemeId;
    defaultLocale: string;
  }): Promise<Result<Website, DomainError>>;

  assignCustomDomain(
    websiteId: WebsiteId,
    domain: string,
  ): Promise<Result<Website, DomainError>>;

  publish(websiteId: WebsiteId): Promise<Result<Website, DomainError>>;
  unpublish(websiteId: WebsiteId): Promise<Result<Website, DomainError>>;
  archive(websiteId: WebsiteId): Promise<Result<Website, DomainError>>;

  updateSettings(
    websiteId: WebsiteId,
    changes: Partial<Omit<WebsiteSettings, "websiteId" | "audit">>,
  ): Promise<Result<WebsiteSettings, DomainError>>;

  applyTheme(websiteId: WebsiteId, themeId: ThemeId): Promise<Result<Website, DomainError>>;
}
