/**
 * Minimal, explicit registration password policy.
 *
 * - minimum length of 12 characters
 * - maximum reasonable length to prevent abuse
 * - reject known-empty or whitespace-only values
 * - do not require arbitrary character-class rules
 * - never log passwords
 * - never include passwords in errors or events
 */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 256;
export function validatePassword(password) {
    if (typeof password !== "string" || password.trim().length === 0) {
        return { ok: false, error: { code: "weak_password", message: "Password is required." } };
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
        return { ok: false, error: { code: "weak_password", message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` } };
    }
    if (password.length > PASSWORD_MAX_LENGTH) {
        return { ok: false, error: { code: "weak_password", message: `Password must not exceed ${PASSWORD_MAX_LENGTH} characters.` } };
    }
    if (password.trim().length !== password.length) {
        return { ok: false, error: { code: "weak_password", message: "Password must not have leading or trailing whitespace." } };
    }
    return { ok: true };
}
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function normalizeEmail(email) {
    if (typeof email !== "string")
        return null;
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(trimmed))
        return null;
    return trimmed;
}
export function validateDisplayName(displayName) {
    const trimmed = displayName.trim();
    if (trimmed.length === 0) {
        return { ok: false, error: { code: "input_validation", message: "Display name is required.", field: "displayName", value: displayName } };
    }
    if (trimmed.length > 200) {
        return { ok: false, error: { code: "input_validation", message: "Display name must not exceed 200 characters.", field: "displayName", value: displayName } };
    }
    return { ok: true };
}
//# sourceMappingURL=validator.js.map