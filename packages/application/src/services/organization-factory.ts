/**
 * Application-layer organization factory helper.
 *
 * Resolves ID and timestamp through injected runtime ports (Clock,
 * IdGenerator), then invokes the pure Domain factory to produce an
 * OrganizationDraft.
 *
 * Domain stays pure — it receives already-resolved values.
 * Application owns the bridging of runtime ports to domain values.
 */
import type {
  OrganizationId,
  PlanId,
  Slug,
  ISODateString,
  OrganizationDraft,
} from "@livingsites/domain";
import { createOrganizationDraft } from "@livingsites/domain";

/**
 * Application-owned clock port. Structurally compatible with
 * @livingsites/platform Clock. Application does not import Platform.
 */
export interface AppClock {
  nowIso(): string;
  nowMs(): number;
}

/**
 * Application-owned id generator port. Structurally compatible with
 * @livingsites/platform IdGenerator. Application does not import Platform.
 */
export interface AppIdGenerator {
  generate(): string;
  generatePrefixed(prefix: string): string;
}

export interface CreateOrganizationDraftViaPortsInput {
  readonly name: string;
  readonly slug: Slug;
  readonly billingEmail: string;
  readonly planId: PlanId | null;
  readonly clock: AppClock;
  readonly idGenerator: AppIdGenerator;
}

export function createOrganizationDraftViaPorts(
  input: CreateOrganizationDraftViaPortsInput,
): OrganizationDraft {
  const id = input.idGenerator.generatePrefixed("org") as OrganizationId;
  const now = input.clock.nowIso() as ISODateString;

  return createOrganizationDraft({
    id,
    name: input.name,
    slug: input.slug,
    billingEmail: input.billingEmail,
    planId: input.planId,
    now,
  });
}
