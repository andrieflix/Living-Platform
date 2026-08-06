/**
 * Composition root — development wiring.
 *
 * Uses deterministic/in-memory adapters for local development. This is
 * explicitly named development and is NOT for production use.
 *
 * May use an in-memory PlanRepository, no-op event behavior, and either
 * an in-memory or configured development database for the organization
 * repository.
 */
import { FakeClock, DeterministicIdGenerator } from "@livingsites/platform";
import type { Logger } from "@livingsites/platform";
import { InMemoryOrganizationRepository, InMemoryPlanRepository } from "@livingsites/test-support";
import type { EventPublisher } from "@livingsites/application";
import { createOrganization } from "@livingsites/application";
import type { CreateOrganizationDeps } from "@livingsites/application";
export interface DevelopmentCompositionConfig {
    readonly initialClockMs?: number;
    readonly eventPublisher?: EventPublisher;
}
export interface DevelopmentComposition {
    readonly clock: FakeClock;
    readonly idGenerator: DeterministicIdGenerator;
    readonly logger: Logger;
    readonly eventPublisher: EventPublisher;
    readonly organizationRepository: InMemoryOrganizationRepository;
    readonly planRepository: InMemoryPlanRepository;
    readonly createOrganization: typeof createOrganization;
    readonly createOrganizationDeps: CreateOrganizationDeps;
}
export declare function composeDevelopment(config?: DevelopmentCompositionConfig): DevelopmentComposition;
//# sourceMappingURL=development.d.ts.map