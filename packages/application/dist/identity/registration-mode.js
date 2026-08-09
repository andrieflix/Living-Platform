export const DEFAULT_DEVELOPMENT_REGISTRATION_MODE = "open";
export const DEFAULT_PRODUCTION_REGISTRATION_MODE = "invite_only";
export function parseRegistrationMode(value) {
    if (value === "open" || value === "invite_only" || value === "disabled") {
        return value;
    }
    return DEFAULT_PRODUCTION_REGISTRATION_MODE;
}
//# sourceMappingURL=registration-mode.js.map