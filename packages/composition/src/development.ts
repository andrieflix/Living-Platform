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
import type { Logger } from "@livingsites/platform";
import {
  InMemoryOrganizationRepository,
  InMemoryPlanRepository,
  NoopEventPublisher,
} from "@livingsites/test-support";
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

export function composeDevelopment(config: DevelopmentCompositionConfig = {}): DevelopmentComposition {
  const clock = new FakeClock(config.initialClockMs ?? 0);
  const idGenerator = new DeterministicIdGenerator();
  const logger = new NoopLogger();
  const eventPublisher = config.eventPublisher ?? new NoopEventPublisher();
  const organizationRepository = new InMemoryOrganizationRepository();
  const planRepository = new InMemoryPlanRepository();

  const createOrganizationDeps: CreateOrganizationDeps = {
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
