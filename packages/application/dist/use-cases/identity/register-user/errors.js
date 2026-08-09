export function mapAuthErrorToRegisterError(err) {
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
//# sourceMappingURL=errors.js.map