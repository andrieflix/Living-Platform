import type { Website, WebsiteSettings, WebsiteStatus, WebsiteId, OrganizationId, PaginatedResult, PaginationParams, AggregateVersion } from "@livingsites/domain";
import type { CreateResult, SaveResult, MutationResult } from "../contracts";
export interface WebsiteListParams extends PaginationParams {
    organizationId?: OrganizationId;
    status?: WebsiteStatus;
    search?: string;
}
export interface WebsiteRepository {
    findById(id: WebsiteId): Promise<Website | null>;
    findByCustomDomain(domain: string): Promise<Website | null>;
    findByFallbackDomain(domain: string): Promise<Website | null>;
    list(params: WebsiteListParams): Promise<PaginatedResult<Website>>;
    create(candidate: Omit<Website, "id" | "audit" | "version">): Promise<CreateResult<Website>>;
    save(aggregate: Website, expectedVersion: AggregateVersion): Promise<SaveResult<Website>>;
    softDelete(id: WebsiteId, expectedVersion: AggregateVersion): Promise<MutationResult>;
}
/**
 * WebsiteSettings is a child entity of the Website aggregate. It has no
 * independent repository port. Settings are loaded and saved through the
 * WebsiteRepository as part of the Website aggregate. This type is exported
 * for use-case parameter shaping only — it is not a repository.
 */
export type WebsiteSettingsShape = WebsiteSettings;
//# sourceMappingURL=website.d.ts.map