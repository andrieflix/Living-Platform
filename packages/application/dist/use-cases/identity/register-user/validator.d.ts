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
export declare const PASSWORD_MIN_LENGTH = 12;
export declare const PASSWORD_MAX_LENGTH = 256;
export declare function validatePassword(password: string): {
    ok: true;
} | {
    ok: false;
    error: {
        code: "weak_password";
        message: string;
    };
};
export declare function normalizeEmail(email: string): string | null;
export declare function validateDisplayName(displayName: string): {
    ok: true;
} | {
    ok: false;
    error: {
        code: "input_validation";
        message: string;
        field: "displayName";
        value: string;
    };
};
//# sourceMappingURL=validator.d.ts.map