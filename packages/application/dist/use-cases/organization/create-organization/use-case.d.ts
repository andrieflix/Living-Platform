/**
 * CreateOrganization use case.
 *
 * Execution flow:
 *  1. Validate input
 *  2. Normalize accepted input
 *  3. Check whether the slug already exists
 *  4. Load and validate the optional Plan
 *  5. Build PolicyContext
 *  6. Evaluate the organization creation policy chain
 *  7. Create the OrganizationDraft through the Application factory helper
 *  8. Persist through OrganizationCreator.create
 *  9. Confirm the persisted aggregate returns at version 1
 * 10. Emit OrganizationCreated only after successful persistence
 * 11. Return a typed Result
 */
import type { Result } from "@livingsites/domain";
import type { OrganizationReader, OrganizationCreator, PlanReader } from "../../../repositories/organization";
import type { EventPublisher } from "../../../services/event-publisher";
import type { OrganizationCreationPersistence } from "../../../services/outbox";
import type { AppClock, AppIdGenerator } from "../../../services/organization-factory";
import type { CreateOrganizationInput } from "./input";
import type { CreateOrganizationOutput } from "./output";
import type { CreateOrganizationError } from "./errors";
export interface CreateOrganizationDeps {
    readonly organizationRepository: OrganizationReader & OrganizationCreator;
    readonly planRepository: PlanReader;
    readonly eventPublisher: EventPublisher;
    readonly clock: AppClock;
    readonly idGenerator: AppIdGenerator;
    /**
     * Optional: when provided, the use case uses this port to atomically
     * persist the Organization and the OrganizationCreated outbox record
     * in a single transaction. When absent, the use case falls back to
     * the separate create + publish flow (used by in-memory/test wiring).
     */
    readonly organizationCreationPersistence?: OrganizationCreationPersistence;
}
export declare function createOrganization(input: CreateOrganizationInput, deps: CreateOrganizationDeps): Promise<Result<CreateOrganizationOutput, CreateOrganizationError>>;
//# sourceMappingURL=use-case.d.ts.map