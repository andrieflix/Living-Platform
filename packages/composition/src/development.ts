/**
 * Composition root — development wiring.
 *
 * Uses deterministic/in-memory adapters for local development. This is
 * explicitly named development and is NOT for production use.
 */
import { FakeClock, DeterministicIdGenerator, NoopLogger } from "@livingsites/platform";
import type { Logger } from "@livingsites/platform";
import {
  InMemoryOrganizationRepository,
  InMemoryPlanRepository,
  InMemoryUserRepository,
  FakeAuthenticationAdapter,
  CapturingVerificationEmailAdapter,
  NoopEventPublisher,
} from "@livingsites/test-support";
import type { EventPublisher, EmailVerificationPort } from "@livingsites/application";
import { createOrganization, registerUser } from "@livingsites/application";
import type { CreateOrganizationDeps, RegisterUserDeps } from "@livingsites/application";

export interface DevelopmentCompositionConfig {
  readonly initialClockMs?: number;
  readonly eventPublisher?: EventPublisher;
  readonly registrationMode?: "open" | "invite_only" | "disabled";
  readonly emailVerificationPort?: EmailVerificationPort;
}

export interface DevelopmentComposition {
  readonly clock: FakeClock;
  readonly idGenerator: DeterministicIdGenerator;
  readonly logger: Logger;
  readonly eventPublisher: EventPublisher;
  readonly organizationRepository: InMemoryOrganizationRepository;
  readonly planRepository: InMemoryPlanRepository;
  readonly userRepository: InMemoryUserRepository;
  readonly authenticationPort: FakeAuthenticationAdapter;
  readonly emailVerificationPort: EmailVerificationPort;
  readonly createOrganization: typeof createOrganization;
  readonly createOrganizationDeps: CreateOrganizationDeps;
  readonly registerUser: typeof registerUser;
  readonly registerUserDeps: RegisterUserDeps;
}

export function composeDevelopment(config: DevelopmentCompositionConfig = {}): DevelopmentComposition {
  const clock = new FakeClock(config.initialClockMs ?? 0);
  const idGenerator = new DeterministicIdGenerator();
  const logger = new NoopLogger();
  const eventPublisher = config.eventPublisher ?? new NoopEventPublisher();
  const organizationRepository = new InMemoryOrganizationRepository();
  const planRepository = new InMemoryPlanRepository();
  const userRepository = new InMemoryUserRepository();
  const authenticationPort = new FakeAuthenticationAdapter();
  const emailVerificationPort = config.emailVerificationPort ?? new CapturingVerificationEmailAdapter();

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
