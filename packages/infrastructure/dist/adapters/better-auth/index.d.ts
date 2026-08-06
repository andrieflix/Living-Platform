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
import { betterAuth } from "better-auth";
type BetterAuthInstance = ReturnType<typeof betterAuth>;
import type { AuthenticationError, AuthenticationPort, RegistrationInput, SignInInput, RegistrationResult, SignInResult, SessionResult, EmailVerificationResult } from "@livingsites/application";
import type { Result, AuthSubjectId } from "@livingsites/domain";
import type { Logger } from "@livingsites/platform";
export interface BetterAuthAdapterConfig {
    readonly auth: BetterAuthInstance;
    readonly logger: Logger;
}
export declare class BetterAuthAdapter implements AuthenticationPort {
    private readonly auth;
    private readonly logger;
    constructor(config: BetterAuthAdapterConfig);
    registerWithEmail(input: RegistrationInput): Promise<RegistrationResult>;
    signInWithEmail(input: SignInInput): Promise<SignInResult>;
    signOut(sessionToken: string): Promise<Result<void, AuthenticationError>>;
    getSession(sessionToken: string): Promise<SessionResult>;
    revokeSession(sessionToken: string): Promise<Result<void, AuthenticationError>>;
    verifyEmail(token: string): Promise<EmailVerificationResult>;
    generateEmailVerificationToken(authSubjectId: AuthSubjectId): Promise<Result<string, AuthenticationError>>;
}
export {};
//# sourceMappingURL=index.d.ts.map