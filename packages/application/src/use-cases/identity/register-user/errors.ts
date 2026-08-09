import type { AuthenticationError } from "../../../identity/port";

export type RegisterUserError =
  | { readonly code: "input_validation"; readonly message: string; readonly field: string; readonly value: string }
  | { readonly code: "weak_password"; readonly message: string }
  | { readonly code: "duplicate_email"; readonly message: string; readonly email: string }
  | { readonly code: "identity_provider_failure"; readonly message: string }
  | { readonly code: "persistence_unavailable"; readonly message: string }
  | { readonly code: "invalid_persistence_state"; readonly message: string }
  | { readonly code: "registration_disabled"; readonly message: string }
  | { readonly code: "invitation_required"; readonly message: string }
  | { readonly code: "event_persistence_failure"; readonly message: string };

export function mapAuthErrorToRegisterError(err: AuthenticationError): RegisterUserError {
  switch (err.code) {
    case "duplicate_email":
      return { code: "duplicate_email", message: err.message, email: err.email };
    case "weak_password":
      return { code: "weak_password", message: err.message };
    case "invalid_email":
      return { code: "input_validation", message: err.message, field: "email", value: err.email };
    case "identity_provider_failure":
      return { code: "identity_provider_failure", message: err.message };
    case "registration_disabled":
      return { code: "registration_disabled", message: err.message };
    case "invitation_required":
      return { code: "invitation_required", message: err.message };
    default:
      return { code: "identity_provider_failure", message: err.message };
  }
}
