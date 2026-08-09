/**
 * Fake authentication adapter for unit tests.
 *
 * Simulates registration, sign-in, session management, and email verification
 * without requiring a real Better Auth instance. Captures all operations for
 * assertion. NOT for production use.
 */
import type { AuthenticationPort, RegistrationInput, SignInInput, RegistrationResult, SignInResult, SessionResult, EmailVerificationResult, AuthenticationError } from "@livingsites/application";
import type { Result, AuthSubjectId } from "@livingsites/domain";
export declare class FakeAuthenticationAdapter implements AuthenticationPort {
    private credentials;
    private sessions;
    private verificationTokens;
    private revokedSubjects;
    readonly registrationCalls: RegistrationInput[];
    readonly signInCalls: SignInInput[];
    readonly signOutCalls: string[];
    readonly revokeCalls: string[];
    readonly verificationEmails: {
        email: string;
        verificationUrl: string;
    }[];
    failRegistration: boolean;
    failSignIn: boolean;
    registerWithEmail(input: RegistrationInput): Promise<RegistrationResult>;
    signInWithEmail(input: SignInInput): Promise<SignInResult>;
    signOut(sessionToken: string): Promise<Result<void, AuthenticationError>>;
    getSession(sessionToken: string): Promise<SessionResult>;
    revokeSession(sessionToken: string): Promise<Result<void, AuthenticationError>>;
    verifyEmail(token: string): Promise<EmailVerificationResult>;
    generateEmailVerificationToken(authSubjectId: AuthSubjectId): Promise<Result<string, AuthenticationError>>;
    clear(): void;
}
//# sourceMappingURL=fake-authentication-adapter.d.ts.map