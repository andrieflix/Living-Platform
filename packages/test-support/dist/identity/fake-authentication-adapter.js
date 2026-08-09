let subjectCounter = 0;
let sessionCounter = 0;
export class FakeAuthenticationAdapter {
    credentials = new Map(); // email -> credential
    sessions = new Map(); // token -> session
    verificationTokens = new Map(); // token -> email
    revokedSubjects = new Set();
    registrationCalls = [];
    signInCalls = [];
    signOutCalls = [];
    revokeCalls = [];
    verificationEmails = [];
    // Test configuration: set to simulate failures
    failRegistration = false;
    failSignIn = false;
    async registerWithEmail(input) {
        this.registrationCalls.push(input);
        if (this.failRegistration) {
            return { ok: false, error: { code: "identity_provider_failure", message: "Simulated failure." } };
        }
        const normalizedEmail = input.email.trim().toLowerCase();
        if (this.credentials.has(normalizedEmail)) {
            return { ok: false, error: { code: "duplicate_email", message: "An account with this email already exists.", email: normalizedEmail } };
        }
        const authSubjectId = `auth_${++subjectCounter}`;
        const credential = {
            authSubjectId,
            email: normalizedEmail,
            password: input.password,
            emailVerified: false,
            displayName: input.displayName,
        };
        this.credentials.set(normalizedEmail, credential);
        const token = `sess_${++sessionCounter}`;
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        this.sessions.set(token, { token, authSubjectId, expiresAt });
        const identity = {
            authSubjectId: authSubjectId,
            email: normalizedEmail,
            emailVerified: false,
        };
        const session = {
            sessionToken: token,
            identity,
            expiresAt: expiresAt.toISOString(),
        };
        return { ok: true, value: session };
    }
    async signInWithEmail(input) {
        this.signInCalls.push(input);
        if (this.failSignIn) {
            return { ok: false, error: { code: "invalid_credentials", message: "Invalid email or password." } };
        }
        const normalizedEmail = input.email.trim().toLowerCase();
        const credential = this.credentials.get(normalizedEmail);
        if (!credential || credential.password !== input.password) {
            return { ok: false, error: { code: "invalid_credentials", message: "Invalid email or password." } };
        }
        if (this.revokedSubjects.has(credential.authSubjectId)) {
            return { ok: false, error: { code: "invalid_credentials", message: "Account revoked." } };
        }
        const token = `sess_${++sessionCounter}`;
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        this.sessions.set(token, { token, authSubjectId: credential.authSubjectId, expiresAt });
        const identity = {
            authSubjectId: credential.authSubjectId,
            email: credential.email,
            emailVerified: credential.emailVerified,
        };
        const session = {
            sessionToken: token,
            identity,
            expiresAt: expiresAt.toISOString(),
        };
        return { ok: true, value: session };
    }
    async signOut(sessionToken) {
        this.signOutCalls.push(sessionToken);
        this.sessions.delete(sessionToken);
        return { ok: true, value: undefined };
    }
    async getSession(sessionToken) {
        const session = this.sessions.get(sessionToken);
        if (!session) {
            return { ok: false, error: { code: "session_not_found", message: "No active session." } };
        }
        if (session.expiresAt < new Date()) {
            this.sessions.delete(sessionToken);
            return { ok: false, error: { code: "session_expired", message: "Session has expired." } };
        }
        const credential = Array.from(this.credentials.values()).find((c) => c.authSubjectId === session.authSubjectId);
        if (!credential) {
            return { ok: false, error: { code: "session_not_found", message: "No active session." } };
        }
        const identity = {
            authSubjectId: credential.authSubjectId,
            email: credential.email,
            emailVerified: credential.emailVerified,
        };
        return {
            ok: true,
            value: {
                sessionToken: session.token,
                identity,
                expiresAt: session.expiresAt.toISOString(),
            },
        };
    }
    async revokeSession(sessionToken) {
        this.revokeCalls.push(sessionToken);
        const session = this.sessions.get(sessionToken);
        if (session) {
            this.sessions.delete(sessionToken);
            this.revokedSubjects.add(session.authSubjectId);
        }
        return { ok: true, value: undefined };
    }
    async verifyEmail(token) {
        const email = this.verificationTokens.get(token);
        if (!email) {
            return { ok: false, error: { code: "verification_failed", message: "Invalid verification token." } };
        }
        const credential = this.credentials.get(email);
        if (!credential) {
            return { ok: false, error: { code: "verification_failed", message: "User not found." } };
        }
        credential.emailVerified = true;
        this.verificationTokens.delete(token);
        const identity = {
            authSubjectId: credential.authSubjectId,
            email: credential.email,
            emailVerified: true,
        };
        return { ok: true, value: identity };
    }
    async generateEmailVerificationToken(authSubjectId) {
        const credential = Array.from(this.credentials.values()).find((c) => c.authSubjectId === String(authSubjectId));
        if (!credential) {
            return { ok: false, error: { code: "identity_provider_failure", message: "User not found." } };
        }
        const token = `verify_${++subjectCounter}`;
        this.verificationTokens.set(token, credential.email);
        const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;
        this.verificationEmails.push({ email: credential.email, verificationUrl });
        return { ok: true, value: token };
    }
    // Test helpers
    clear() {
        this.credentials.clear();
        this.sessions.clear();
        this.verificationTokens.clear();
        this.revokedSubjects.clear();
        this.registrationCalls.length = 0;
        this.signInCalls.length = 0;
        this.signOutCalls.length = 0;
        this.revokeCalls.length = 0;
        this.verificationEmails.length = 0;
    }
}
//# sourceMappingURL=fake-authentication-adapter.js.map