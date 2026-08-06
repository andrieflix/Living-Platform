/**
 * Composition root — test wiring.
 *
 * Uses deterministic test-support adapters. No database, no network.
 * The InMemoryEventPublisher captures events for assertion.
 */
import { FakeClock, DeterministicIdGenerator } from "@livingsites/platform";
import type { Logger } from "@livingsites/platform";
import { InMemoryOrganizationRepository, InMemoryPlanRepository, InMemoryEventPublisher } from "@livingsites/test-support";
import { createOrganization } from "@livingsites/application";
import type { CreateOrganizationDeps } from "@livingsites/application";
export interface TestCompositionConfig {
    readonly initialClockMs?: number;
}
export interface TestComposition {
    readonly clock: FakeClock;
    readonly idGenerator: DeterministicIdGenerator;
    readonly logger: Logger;
    readonly eventPublisher: InMemoryEventPublisher;
    readonly organizationRepository: InMemoryOrganizationRepository;
    readonly planRepository: InMemoryPlanRepository;
    readonly createOrganization: typeof createOrganization;
    readonly createOrganizationDeps: CreateOrganizationDeps;
}
export declare function composeTest(config?: TestCompositionConfig): TestComposition;
//# sourceMappingURL=test.d.ts.map