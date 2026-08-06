/**
 * Typed error union for CreateOrganization.
 *
 * Never exposes raw database errors. Each error variant maps to a specific
 * business or infrastructure condition that the caller can handle.
 */
export interface InputValidationError {
    readonly code: "input_validation";
    readonly message: string;
    readonly field: "name" | "slug" | "billingEmail" | "planId";
    readonly value: string;
}
export interface DuplicateSlugError {
    readonly code: "duplicate_slug";
    readonly message: string;
    readonly slug: string;
}
export interface PlanNotAvailableError {
    readonly code: "plan_not_available";
    readonly message: string;
    readonly planId: string;
}
export interface PolicyDenialError {
    readonly code: "policy_denial";
    readonly message: string;
    readonly policyName: string;
    readonly details?: Readonly<Record<string, unknown>>;
}
export interface PersistenceUnavailableAppError {
    readonly code: "persistence_unavailable";
    readonly message: string;
}
export interface InvalidPersistenceStateAppError {
    readonly code: "invalid_persistence_state";
    readonly message: string;
}
export type CreateOrganizationError = InputValidationError | DuplicateSlugError | PlanNotAvailableError | PolicyDenialError | PersistenceUnavailableAppError | InvalidPersistenceStateAppError;
//# sourceMappingURL=errors.d.ts.map