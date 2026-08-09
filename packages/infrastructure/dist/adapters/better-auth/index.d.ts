/**
 * Better Auth adapter — implements the Application AuthenticationPort.
 *
 * This is the ONLY place that imports better-auth. Domain and Application
 * layers never see Better Auth types. The adapter translates between
 * provider-specific responses and the provider-independent Application types.
 *
 * The Better Auth instance is created at the Composition boundary and passed
 * in here. This adapter does not own configuration or secrets.
 */
import type { AuthenticationError, AuthenticationPort, RegistrationInput, SignInInput, RegistrationResult, SignInResult, SessionResult, EmailVerificationResult } from "@livingsites/application";
import type { Result, AuthSubjectId } from "@livingsites/domain";
import type { Logger } from "@livingsites/platform";
export { asBetterAuthInstance } from "./cast";
/**
 * Minimal structural type for the Better Auth instance. We only use
 * `.handler`, `.api.signUpEmail`, `.api.signInEmail`, `.api.signOut`,
 * `.api.getSession`, `.api.revokeSession`, `.api.verifyEmail`,
 * `.api.sendVerificationEmail`. Defining a structural interface avoids
 * the generic-incompatibility problem with `ReturnType<typeof betterAuth>`.
 */
export interface BetterAuthInstance {
    handler(req: Request): Response | Promise<Response>;
    readonly api: {
        signUpEmail(input: {
            body: Record<string, unknown>;
        }): Promise<{
            token: string | null;
            user: {
                id: string;
                email: string;
                emailVerified: boolean;
                name: string;
            };
        } | null>;
        signInEmail(input: {
            body: Record<string, unknown>;
        }): Promise<{
            token: string;
            user: {
                id: string;
                email: string;
                emailVerified: boolean;
                name: string;
            };
            redirect: boolean;
        } | null>;
        signOut(input: {
            headers: Headers;
        }): Promise<{
            status: boolean;
        }>;
        getSession(input: {
            headers: Headers;
        }): Promise<{
            session: {
                token: string;
                expiresAt: Date;
            };
            user: {
                id: string;
                email: string;
                emailVerified: boolean;
                name: string;
            };
        } | null>;
        revokeSession(input: {
            body: Record<string, unknown>;
            headers: Headers;
        }): Promise<unknown>;
        verifyEmail(input: {
            query: {
                token: string;
            };
        }): Promise<{
            status: boolean;
        } | null>;
        sendVerificationEmail(input: {
            body: Record<string, unknown>;
        }): Promise<unknown>;
    };
}
export interface BetterAuthAdapterConfig {
    readonly auth: BetterAuthInstance;
    readonly logger: Logger;
}
export declare class BetterAuthAdapter implements AuthenticationPort {
    private readonly _auth;
    private readonly logger;
    constructor(config: BetterAuthAdapterConfig);
    get auth(): BetterAuthInstance;
    registerWithEmail(input: RegistrationInput): Promise<RegistrationResult>;
    signInWithEmail(input: SignInInput): Promise<SignInResult>;
    signOut(sessionToken: string): Promise<Result<void, AuthenticationError>>;
    getSession(sessionToken: string): Promise<SessionResult>;
    revokeSession(sessionToken: string): Promise<Result<void, AuthenticationError>>;
    verifyEmail(token: string): Promise<EmailVerificationResult>;
    generateEmailVerificationToken(authSubjectId: AuthSubjectId): Promise<Result<string, AuthenticationError>>;
}
//# sourceMappingURL=index.d.ts.map