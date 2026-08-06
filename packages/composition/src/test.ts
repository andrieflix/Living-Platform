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
  InMemoryEventPublisher,
} from "@livingsites/test-support";
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

export function composeTest(config: TestCompositionConfig = {}): TestComposition {
  const clock = new FakeClock(config.initialClockMs ?? 0);
  const idGenerator = new DeterministicIdGenerator();
  const logger = new NoopLogger();
  const eventPublisher = new InMemoryEventPublisher();
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
