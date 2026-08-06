function mapAuthError(err) {
    const e = err;
    const message = typeof e?.message === "string" ? e.message : "Authentication error.";
    const code = typeof e?.code === "string" ? e.code : "";
    if (code === "INVALID_PASSWORD" || code === "INVALID_EMAIL" || code === "INVALID_CREDENTIALS") {
        return { code: "invalid_credentials", message: "Invalid email or password." };
    }
    if (code === "USER_ALREADY_EXISTS" || code === "USER_EXISTS" || /already.*exists/i.test(message)) {
        return { code: "duplicate_email", message: "An account with this email already exists.", email: "" };
    }
    if (code === "PASSWORD_TOO_SHORT" || code === "PASSWORD_TOO_LONG" || /password/i.test(message)) {
        return { code: "weak_password", message: "Password does not meet requirements." };
    }
    if (code === "RATE_LIMIT" || /rate.*limit/i.test(message)) {
        return { code: "rate_limited", message: "Too many requests. Please try again later." };
    }
    if (/verification.*token.*expired/i.test(message) || /expired/i.test(message)) {
        return { code: "verification_token_expired", message: "Verification token has expired." };
    }
    return { code: "identity_provider_failure", message: "Authentication service error." };
}
function toIdentity(user) {
    return {
        authSubjectId: user.id,
        email: user.email,
        emailVerified: Boolean(user.emailVerified),
    };
}
function toSession(token, user, expiresAt) {
    return {
        sessionToken: token,
        identity: toIdentity(user),
        expiresAt: expiresAt instanceof Date ? expiresAt.toISOString() : String(expiresAt),
    };
}
export class BetterAuthAdapter {
    auth;
    logger;
    constructor(config) {
        this.auth = config.auth;
        this.logger = config.logger;
    }
    async registerWithEmail(input) {
        try {
            const result = await this.auth.api.signUpEmail({
                body: {
                    email: input.email,
                    password: input.password,
                    name: input.displayName,
                },
            });
            if (!result) {
                return { ok: false, error: { code: "identity_provider_failure", message: "Registration returned no result." } };
            }
            const user = result.user;
            if (!user) {
                return { ok: false, error: { code: "identity_provider_failure", message: "Registration did not return a user." } };
            }
            const token = result.token;
            if (!token) {
                return { ok: false, error: { code: "identity_provider_failure", message: "Registration did not return a session token." } };
            }
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            return { ok: true, value: toSession(token, user, expiresAt) };
        }
        catch (err) {
            this.logger.error("registerWithEmail failed", { error: String(err) });
            return { ok: false, error: mapAuthError(err) };
        }
    }
    async signInWithEmail(input) {
        try {
            const result = await this.auth.api.signInEmail({
                body: {
                    email: input.email,
                    password: input.password,
                },
            });
            if (!result) {
                return { ok: false, error: { code: "invalid_credentials", message: "Invalid email or password." } };
            }
            const user = result.user;
            const token = result.token;
            if (!user || !token) {
                return { ok: false, error: { code: "invalid_credentials", message: "Invalid email or password." } };
            }
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            return { ok: true, value: toSession(token, user, expiresAt) };
        }
        catch (err) {
            this.logger.error("signInWithEmail failed", { error: String(err) });
            return { ok: false, error: mapAuthError(err) };
        }
    }
    async signOut(sessionToken) {
        try {
            await this.auth.api.signOut({
                headers: new Headers({ authorization: `Bearer ${sessionToken}` }),
            });
            return { ok: true, value: undefined };
        }
        catch (err) {
            this.logger.error("signOut failed", { error: String(err) });
            return { ok: false, error: { code: "session_not_found", message: "Session not found or already expired." } };
        }
    }
    async getSession(sessionToken) {
        try {
            const result = await this.auth.api.getSession({
                headers: new Headers({ authorization: `Bearer ${sessionToken}` }),
            });
            if (!result) {
                return { ok: false, error: { code: "session_not_found", message: "No active session." } };
            }
            const session = result.session;
            const user = result.user;
            if (!session || !user) {
                return { ok: false, error: { code: "session_not_found", message: "No active session." } };
            }
            return { ok: true, value: toSession(session.token, user, session.expiresAt) };
        }
        catch (err) {
            this.logger.error("getSession failed", { error: String(err) });
            return { ok: false, error: { code: "session_not_found", message: "Session lookup failed." } };
        }
    }
    async revokeSession(sessionToken) {
        try {
            await this.auth.api.revokeSession({
                body: { token: sessionToken },
                headers: new Headers({ authorization: `Bearer ${sessionToken}` }),
            });
            return { ok: true, value: undefined };
        }
        catch (err) {
            this.logger.error("revokeSession failed", { error: String(err) });
            return { ok: false, error: { code: "session_not_found", message: "Session could not be revoked." } };
        }
    }
    async verifyEmail(token) {
        try {
            const result = await this.auth.api.verifyEmail({
                query: { token },
            });
            if (!result || !result.status) {
                return { ok: false, error: { code: "verification_failed", message: "Email verification failed." } };
            }
            const identity = {
                authSubjectId: "",
                email: "",
                emailVerified: true,
            };
            return { ok: true, value: identity };
        }
        catch (err) {
            this.logger.error("verifyEmail failed", { error: String(err) });
            const e = err;
            if (e && typeof e.message === "string" && /expired/i.test(e.message)) {
                return { ok: false, error: { code: "verification_token_expired", message: "Verification token has expired." } };
            }
            return { ok: false, error: { code: "verification_failed", message: "Email verification failed." } };
        }
    }
    async generateEmailVerificationToken(authSubjectId) {
        try {
            await this.auth.api.sendVerificationEmail({
                body: { email: String(authSubjectId) },
            });
            return { ok: true, value: "" };
        }
        catch (err) {
            this.logger.error("generateEmailVerificationToken failed", { error: String(err) });
            return { ok: false, error: { code: "identity_provider_failure", message: "Failed to generate verification token." } };
        }
    }
}
//# sourceMappingURL=index.js.map