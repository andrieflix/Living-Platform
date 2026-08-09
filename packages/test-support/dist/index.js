/**
 * @livingsites/test-support — test adapters for the Living Sites platform.
 *
 * In-memory repositories, event publishers, and deterministic runtime
 * for tests and development. NOT for production use.
 *
 * Dependency direction:
 *   test-support → application (contracts)
 *   test-support → domain (entity types)
 *   test-support → platform (runtime capabilities)
 *
 * Production packages and production entry points must NOT import test-support.
 */
export { InMemoryOrganizationRepository, InMemoryPlanRepository, InMemoryFeatureRepository } from "./repositories/in-memory-organization-repository";
export { InMemoryUserRepository } from "./repositories/in-memory-user-repository";
export { FakeAuthenticationAdapter } from "./identity/fake-authentication-adapter";
export { CapturingVerificationEmailAdapter } from "./identity/capturing-verification-email-adapter";
export { InMemoryEventPublisher } from "./events/in-memory-event-publisher";
export { NoopEventPublisher, FakeClock, DeterministicIdGenerator } from "./platform/test-runtime";
export { runRepositoryContractTests } from "./repositories/contract-tests";
export { runUserRepositoryContractTests } from "./repositories/user-contract-tests";
export { runPlanReaderContractTests, runFeatureReaderContractTests, runOutboxContractTests } from "./repositories/plan-feature-outbox-contract-tests";
//# sourceMappingURL=index.js.map