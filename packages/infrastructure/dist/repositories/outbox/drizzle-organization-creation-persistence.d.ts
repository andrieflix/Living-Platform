import type { Logger } from "@livingsites/platform";
import type { Organization, OrganizationDraft, OrganizationCreatedEvent } from "@livingsites/domain";
import type { CreateResult } from "@livingsites/application";
import type { OrganizationCreationPersistence } from "@livingsites/application";
import type { DrizzleDB } from "../../db/drizzle-instance";
export interface DrizzleOrganizationCreationPersistenceConfig {
    readonly db: DrizzleDB;
    readonly logger: Logger;
    readonly schemaVersion?: string;
}
export declare class DrizzleOrganizationCreationPersistence implements OrganizationCreationPersistence {
    private readonly db;
    private readonly logger;
    private readonly schemaVersion;
    constructor(config: DrizzleOrganizationCreationPersistenceConfig);
    createWithEvent(draft: OrganizationDraft, event: OrganizationCreatedEvent): Promise<CreateResult<Organization>>;
    private mapCreateError;
}
//# sourceMappingURL=drizzle-organization-creation-persistence.d.ts.map