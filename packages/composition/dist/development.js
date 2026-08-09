/**
 * Composition root — development wiring.
 *
 * Uses deterministic/in-memory adapters for local development. This is
 * explicitly named development and is NOT for production use.
 */
import { FakeClock, DeterministicIdGenerator, NoopLogger } from "@livingsites/platform";
import { InMemoryOrganizationRepository, InMemoryPlanRepository, InMemoryUserRepository, FakeAuthenticationAdapter, CapturingVerificationEmailAdapter, NoopEventPublisher, } from "@livingsites/test-support";
import { createOrganization, registerUser } from "@livingsites/application";
export function composeDevelopment(config = {}) {
    const clock = new FakeClock(config.initialClockMs ?? 0);
    const idGenerator = new DeterministicIdGenerator();
    const logger = new NoopLogger();
    const eventPublisher = config.eventPublisher ?? new NoopEventPublisher();
    const organizationRepository = new InMemoryOrganizationRepository();
    const planRepository = new InMemoryPlanRepository();
    const userRepository = new InMemoryUserRepository();
    const authenticationPort = new FakeAuthenticationAdapter();
    const emailVerificationPort = config.emailVerificationPort ?? new CapturingVerificationEmailAdapter();
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
//# sourceMappingURL=development.js.map