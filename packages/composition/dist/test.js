/**
 * Composition root — test wiring.
 *
 * Uses deterministic test-support adapters. No database, no network.
 * The InMemoryEventPublisher captures events for assertion.
 */
import { FakeClock, DeterministicIdGenerator, NoopLogger } from "@livingsites/platform";
import { InMemoryOrganizationRepository, InMemoryPlanRepository, InMemoryEventPublisher, } from "@livingsites/test-support";
import { createOrganization } from "@livingsites/application";
export function composeTest(config = {}) {
    const clock = new FakeClock(config.initialClockMs ?? 0);
    const idGenerator = new DeterministicIdGenerator();
    const logger = new NoopLogger();
    const eventPublisher = new InMemoryEventPublisher();
    const organizationRepository = new InMemoryOrganizationRepository();
    const planRepository = new InMemoryPlanRepository();
    const createOrganizationDeps = {
        organizationRepository,
        planRepository,
        eventPublisher,
        clock,
        idGenerator,
    };
    return {
        clock,
        idGenerator,
        logger,
        eventPublisher,
        organizationRepository,
        planRepository,
        createOrganization,
        createOrganizationDeps,
    };
}
//# sourceMappingURL=test.js.map