import type { AuthenticationError } from "../../../identity/port";
export type RegisterUserError = {
    readonly code: "input_validation";
    readonly message: string;
    readonly field: string;
    readonly value: string;
} | {
    readonly code: "weak_password";
    readonly message: string;
} | {
    readonly code: "duplicate_email";
    readonly message: string;
    readonly email: string;
} | {
    readonly code: "identity_provider_failure";
    readonly message: string;
} | {
    readonly code: "persistence_unavailable";
    readonly message: string;
} | {
    readonly code: "invalid_persistence_state";
    readonly message: string;
} | {
    readonly code: "registration_disabled";
    readonly message: string;
} | {
    readonly code: "invitation_required";
    readonly message: string;
} | {
    readonly code: "event_persistence_failure";
    readonly message: string;
};
export declare function mapAuthErrorToRegisterError(err: AuthenticationError): RegisterUserError;
//# sourceMappingURL=errors.d.ts.map