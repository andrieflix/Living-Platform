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
import type { PlanId, Slug, OrganizationDraft } from "@livingsites/domain";
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
export declare function createOrganizationDraftViaPorts(input: CreateOrganizationDraftViaPortsInput): OrganizationDraft;
//# sourceMappingURL=organization-factory.d.ts.map