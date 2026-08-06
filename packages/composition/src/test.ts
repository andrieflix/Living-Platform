/**
 * Composition root — test wiring.
 *
 * Uses deterministic test-support adapters. No database, no network.
 * The InMemoryEventPublisher captures events for assertion.
 */
import { FakeClock, DeterministicIdGenerator, NoopLogger } from "@livingsites/platform";
import type { Logger } from "@livingsites/platform";
import {
  InMemoryOrganizationRepository,
  InMemoryPlanRepository,
  InMemoryUserRepository,
  FakeAuthenticationAdapter,
  CapturingVerificationEmailAdapter,
  InMemoryEventPublisher,
} from "@livingsites/test-support";
import { createOrganization, registerUser } from "@livingsites/application";
import type { CreateOrganizationDeps, RegisterUserDeps } from "@livingsites/application";

export interface TestCompositionConfig {
  readonly initialClockMs?: number;
  readonly registrationMode?: "open" | "invite_only" | "disabled";
}

export interface TestComposition {
  readonly clock: FakeClock;
  readonly idGenerator: DeterministicIdGenerator;
  readonly logger: Logger;
  readonly eventPublisher: InMemoryEventPublisher;
  readonly organizationRepository: InMemoryOrganizationRepository;
  readonly planRepository: InMemoryPlanRepository;
  readonly userRepository: InMemoryUserRepository;
  readonly authenticationPort: FakeAuthenticationAdapter;
  readonly emailVerificationPort: CapturingVerificationEmailAdapter;
  readonly createOrganization: typeof createOrganization;
  readonly createOrganizationDeps: CreateOrganizationDeps;
  readonly registerUser: typeof registerUser;
  readonly registerUserDeps: RegisterUserDeps;
}

export function composeTest(config: TestCompositionConfig = {}): TestComposition {
  const clock = new FakeClock(config.initialClockMs ?? 0);
  const idGenerator = new DeterministicIdGenerator();
  const logger = new NoopLogger();
  const eventPublisher = new InMemoryEventPublisher();
  const organizationRepository = new InMemoryOrganizationRepository();
  const planRepository = new InMemoryPlanRepository();
  const userRepository = new InMemoryUserRepository();
  const authenticationPort = new FakeAuthenticationAdapter();
  const emailVerificationPort = new CapturingVerificationEmailAdapter();

  const createOrganizationDeps: CreateOrganizationDeps = {
    organizationRepository,
    planRepository,
    eventPublisher,
    clock,
    idGenerator,
  };

  const registerUserDeps: RegisterUserDeps = {
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
