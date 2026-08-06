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
import { FakeClock, DeterministicIdGenerator, NoopLogger } from "@livingsites/platform";
import { InMemoryOrganizationRepository, InMemoryPlanRepository, NoopEventPublisher, } from "@livingsites/test-support";
import { createOrganization } from "@livingsites/application";
export function composeDevelopment(config = {}) {
    const clock = new FakeClock(config.initialClockMs ?? 0);
    const idGenerator = new DeterministicIdGenerator();
    const logger = new NoopLogger();
    const eventPublisher = config.eventPublisher ?? new NoopEventPublisher();
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
//# sourceMappingURL=development.js.map