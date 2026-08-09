/**
 * Composition root — test wiring.
 *
 * Uses deterministic test-support adapters. No database, no network.
 * The InMemoryEventPublisher captures events for assertion.
 */
import { FakeClock, DeterministicIdGenerator, NoopLogger } from "@livingsites/platform";
import { InMemoryOrganizationRepository, InMemoryPlanRepository, InMemoryUserRepository, FakeAuthenticationAdapter, CapturingVerificationEmailAdapter, InMemoryEventPublisher, } from "@livingsites/test-support";
import { createOrganization, registerUser } from "@livingsites/application";
export function composeTest(config = {}) {
    const clock = new FakeClock(config.initialClockMs ?? 0);
    const idGenerator = new DeterministicIdGenerator();
    const logger = new NoopLogger();
    const eventPublisher = new InMemoryEventPublisher();
    const organizationRepository = new InMemoryOrganizationRepository();
    const planRepository = new InMemoryPlanRepository();
    const userRepository = new InMemoryUserRepository();
    const authenticationPort = new FakeAuthenticationAdapter();
    const emailVerificationPort = new CapturingVerificationEmailAdapter();
    const createOrganizationDeps = {
        organizationRepository,
        planRepository,
        eventPublisher,
        clock,
        idGenerator,
    };
    const registerUserDeps = {
        authenticationPort,
        userReader: userRepository,
        userCreator: userRepository,
        eventPublisher,
        clock,
        idGenerator,
        registrationMode: config.registrationMode ?? "open",
    };
    return {
        clock,
        idGenerator,
        logger,
        eventPublisher,
        organizationRepository,
        planRepository,
        userRepository,
        authenticationPort,
        emailVerificationPort,
        createOrganization,
        createOrganizationDeps,
        registerUser,
        registerUserDeps,
    };
}
//# sourceMappingURL=test.js.map