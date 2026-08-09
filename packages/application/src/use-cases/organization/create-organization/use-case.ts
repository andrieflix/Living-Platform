/**
 * CreateOrganization use case.
 *
 * Execution flow:
 *  1. Validate input
 *  2. Normalize accepted input
 *  3. Check whether the slug already exists
 *  4. Load and validate the optional Plan
 *  5. Build PolicyContext
 *  6. Evaluate the organization creation policy chain
 *  7. Create the OrganizationDraft through the Application factory helper
 *  8. Persist through OrganizationCreator.create
 *  9. Confirm the persisted aggregate returns at version 1
 * 10. Emit OrganizationCreated only after successful persistence
 * 11. Return a typed Result
 */
import type {
  Plan,
  Result,
  OrganizationCreatedEvent,
  ISODateString,
  Slug,
} from "@livingsites/domain";
import type { OrganizationReader, OrganizationCreator, PlanReader } from "../../../repositories/organization";
import type { EventPublisher } from "../../../services/event-publisher";
import type { OrganizationCreationPersistence } from "../../../services/outbox";
import type { AppClock, AppIdGenerator } from "../../../services/organization-factory";
import { createOrganizationDraftViaPorts } from "../../../services/organization-factory";
import type { PolicyContext } from "../../../policies/shared";
import { OrganizationCreationPolicyChain } from "../../../policies/organization";
import type { CreateOrganizationInput } from "./input";
import type { CreateOrganizationOutput } from "./output";
import type { CreateOrganizationError } from "./errors";
import { validateCreateOrganizationInput } from "./validator";

export interface CreateOrganizationDeps {
  readonly organizationRepository: OrganizationReader & OrganizationCreator;
  readonly planRepository: PlanReader;
  readonly eventPublisher: EventPublisher;
  readonly clock: AppClock;
  readonly idGenerator: AppIdGenerator;
  /**
   * Optional: when provided, the use case uses this port to atomically
   * persist the Organization and the OrganizationCreated outbox record
   * in a single transaction. When absent, the use case falls back to
   * the separate create + publish flow (used by in-memory/test wiring).
   */
  readonly organizationCreationPersistence?: OrganizationCreationPersistence;
}

export async function createOrganization(
  input: CreateOrganizationInput,
  deps: CreateOrganizationDeps,
): Promise<Result<CreateOrganizationOutput, CreateOrganizationError>> {
  const validation = validateCreateOrganizationInput(input);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const { name, slug, billingEmail } = validation.normalized;

  const existing = await deps.organizationRepository.findBySlug(slug);
  if (existing !== null) {
    return {
      ok: false,
      error: { code: "duplicate_slug", message: `An organization with slug "${slug}" already exists.`, slug },
    };
  }

  let plan: Plan | null = null;
  let planRequested = false;
  if (input.planId !== undefined) {
    planRequested = true;
    const found = await deps.planRepository.findById(input.planId);
    if (found === null) {
      return {
        ok: false,
        error: { code: "plan_not_available", message: "Selected plan was not found.", planId: String(input.planId) },
      };
    }
    plan = found;
  }

  const policyContext: PolicyContext = {
    now: deps.clock.nowIso(),
  };

  const policyChain = new OrganizationCreationPolicyChain();
  const policyResult = await policyChain.evaluate({
    context: policyContext,
    slug,
    plan,
    planRequested,
  });

  if (!policyResult.allowed) {
    const firstDenial = policyResult.denials[0];
    if (firstDenial === undefined) {
      return {
        ok: false,
        error: { code: "policy_denial", message: "Policy evaluation denied the request.", policyName: "unknown" },
      };
    }
    return {
      ok: false,
      error: {
        code: "policy_denial",
        message: firstDenial.message,
        policyName: firstDenial.policyName,
        details: firstDenial.details,
      },
    };
  }

  const draft = createOrganizationDraftViaPorts({
    name,
    slug: slug as Slug,
    billingEmail,
    planId: input.planId ?? null,
    clock: deps.clock,
    idGenerator: deps.idGenerator,
  });

  const event: OrganizationCreatedEvent = {
    type: "organization.created",
    occurredAt: deps.clock.nowIso() as ISODateString,
    eventScope: { scope: "organization", organizationId: draft.id },
    slug: draft.slug,
    planId: draft.planId,
  };

  if (deps.organizationCreationPersistence) {
    const atomicResult = await deps.organizationCreationPersistence.createWithEvent(draft, event);
    if (!atomicResult.ok) {
      const err = atomicResult.error;
      switch (err.code) {
        case "duplicate_key":
          return {
            ok: false,
            error: { code: "duplicate_slug", message: err.message, slug },
          };
        case "persistence_unavailable":
          return {
            ok: false,
            error: { code: "persistence_unavailable", message: err.message },
          };
        case "invalid_persistence_state":
          return {
            ok: false,
            error: { code: "invalid_persistence_state", message: err.message },
          };
      }
    }

    const created = atomicResult.value;

    if (created.version !== 1) {
      return {
        ok: false,
        error: {
          code: "invalid_persistence_state",
          message: `Expected persisted version 1, got ${created.version}.`,
        },
      };
    }

    return { ok: true, value: { organization: created } };
  }

  const createResult = await deps.organizationRepository.create(draft);
  if (!createResult.ok) {
    const err = createResult.error;
    switch (err.code) {
      case "duplicate_key":
        return {
          ok: false,
          error: { code: "duplicate_slug", message: err.message, slug },
        };
      case "persistence_unavailable":
        return {
          ok: false,
          error: { code: "persistence_unavailable", message: err.message },
        };
      case "invalid_persistence_state":
        return {
          ok: false,
          error: { code: "invalid_persistence_state", message: err.message },
        };
    }
  }

  const created = createResult.value;

  if (created.version !== 1) {
    return {
      ok: false,
      error: {
        code: "invalid_persistence_state",
        message: `Expected persisted version 1, got ${created.version}.`,
      },
    };
  }

  await deps.eventPublisher.publish(event);

  return { ok: true, value: { organization: created } };
}
