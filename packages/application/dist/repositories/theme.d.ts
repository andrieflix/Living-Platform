import type { Theme, ThemeId, OrganizationId, AggregateVersion } from "@livingsites/domain";
import type { CreateResult, SaveResult } from "../contracts";
export interface ThemeRepository {
    findById(id: ThemeId): Promise<Theme | null>;
    listForOrganization(organizationId: OrganizationId): Promise<Theme[]>;
    listSystem(): Promise<Theme[]>;
    create(candidate: Omit<Theme, "id" | "audit" | "version">): Promise<CreateResult<Theme>>;
    save(aggregate: Theme, expectedVersion: AggregateVersion): Promise<SaveResult<Theme>>;
}
//# sourceMappingURL=theme.d.ts.map