/**
 * Provider-independent authentication port.
 *
 * Defines only the capabilities Living Platform needs. Does not expose
 * Better Auth types, cookies, database table types, or provider-specific
 * session objects. Better Auth-specific code belongs in Infrastructure
 * or the application entry-point adapter.
 */
import type { Result } from "@livingsites/domain";
import type { AuthSubjectId } from "@livingsites/domain";

/** The authenticated identity as the Application sees it. */
export interface AuthenticatedIdentity {
  readonly authSubjectId: AuthSubjectId;
  readonly email: string;
  readonly emailVerified: boolean;
}

/** Provider-independent session shape. */
export interface AuthenticationSession {
  readonly sessionToken: string;
  readonly identity: AuthenticatedIdentity;
  readonly expiresAt: string;
}

/** Input for email/password registration. */
export interface RegistrationInput {
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
}

/** Input for email/password sign-in. */
export interface SignInInput {
  readonly email: string;
  readonly password: string;
}

/** Typed authentication errors. Never exposes password hashes or raw provider failures. */
export type AuthenticationError =
  | { readonly code: "invalid_credentials"; readonly message: string }
  | { readonly code: "duplicate_email"; readonly message: string; readonly email: string }
  | { readonly code: "weak_password"; readonly message: string }
  | { readonly code: "invalid_email"; readonly message: string; readonly email: string }
  | { readonly code: "identity_provider_failure"; readonly message: string }
  | { readonly code: "session_not_found"; readonly message: string }
  | { readonly code: "session_expired"; readonly message: string }
  | { readonly code: "email_not_verified"; readonly message: string }
  | { readonly code: "verification_failed"; readonly message: string }
  | { readonly code: "verification_token_expired"; readonly message: string }
  | { readonly code: "rate_limited"; readonly message: string }
  | { readonly code: "registration_disabled"; readonly message: string }
  | { readonly code: "invitation_required"; readonly message: string };

/** Result of a registration attempt. */
export type RegistrationResult = Result<AuthenticationSession, AuthenticationError>;

/** Result of a sign-in attempt. */
export type SignInResult = Result<AuthenticationSession, AuthenticationError>;

/** Result of session retrieval. */
export type SessionResult = Result<AuthenticationSession, AuthenticationError>;

/** Result of email verification. */
export type EmailVerificationResult = Result<AuthenticatedIdentity, AuthenticationError>;

/**
 * Provider-independent authentication port.
 * Infrastructure provides the Better Auth-backed implementation.
 */
export interface AuthenticationPort {
  registerWithEmail(input: RegistrationInput): Promise<RegistrationResult>;
  signInWithEmail(input: SignInInput): Promise<SignInResult>;
  signOut(sessionToken: string): Promise<Result<void, AuthenticationError>>;
  getSession(sessionToken: string): Promise<SessionResult>;
  revokeSession(sessionToken: string): Promise<Result<void, AuthenticationError>>;
  verifyEmail(token: string): Promise<EmailVerificationResult>;
  /**
   * Generate a verification token for the given auth subject. Used by the
   * email-verification flow to send a verification link via the
   * EmailVerificationPort.
   */
  generateEmailVerificationToken(authSubjectId: AuthSubjectId): Promise<Result<string, AuthenticationError>>;
}
