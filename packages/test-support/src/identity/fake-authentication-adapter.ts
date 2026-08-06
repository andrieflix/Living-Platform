/**
 * Fake authentication adapter for unit tests.
 *
 * Simulates registration, sign-in, session management, and email verification
 * without requiring a real Better Auth instance. Captures all operations for
 * assertion. NOT for production use.
 */
import type {
  AuthenticationPort,
  RegistrationInput,
  SignInInput,
  RegistrationResult,
  SignInResult,
  SessionResult,
  EmailVerificationResult,
  AuthenticationSession,
  AuthenticationError,
  AuthenticatedIdentity,
} from "@livingsites/application";
import type { Result, AuthSubjectId } from "@livingsites/domain";

interface StoredCredential {
  authSubjectId: string;
  email: string;
  password: string;
  emailVerified: boolean;
  displayName: string;
}

interface StoredSession {
  token: string;
  authSubjectId: string;
  expiresAt: Date;
}

let subjectCounter = 0;
let sessionCounter = 0;

export class FakeAuthenticationAdapter implements AuthenticationPort {
  private credentials: Map<string, StoredCredential> = new Map(); // email -> credential
  private sessions: Map<string, StoredSession> = new Map(); // token -> session
  private verificationTokens: Map<string, string> = new Map(); // token -> email
  private revokedSubjects: Set<string> = new Set();

  readonly registrationCalls: RegistrationInput[] = [];
  readonly signInCalls: SignInInput[] = [];
  readonly signOutCalls: string[] = [];
  readonly revokeCalls: string[] = [];
  readonly verificationEmails: { email: string; verificationUrl: string }[] = [];

  // Test configuration: set to simulate failures
  failRegistration = false;
  failSignIn = false;

  async registerWithEmail(input: RegistrationInput): Promise<RegistrationResult> {
    this.registrationCalls.push(input);

    if (this.failRegistration) {
      return { ok: false, error: { code: "identity_provider_failure", message: "Simulated failure." } };
    }

    const normalizedEmail = input.email.trim().toLowerCase();
    if (this.credentials.has(normalizedEmail)) {
      return { ok: false, error: { code: "duplicate_email", message: "An account with this email already exists.", email: normalizedEmail } };
    }

    const authSubjectId = `auth_${++subjectCounter}`;
    const credential: StoredCredential = {
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

    const identity: AuthenticatedIdentity = {
      authSubjectId: authSubjectId as AuthSubjectId,
      email: normalizedEmail,
      emailVerified: false,
    };

    const session: AuthenticationSession = {
      sessionToken: token,
      identity,
      expiresAt: expiresAt.toISOString(),
    };

    return { ok: true, value: session };
  }

  async signInWithEmail(input: SignInInput): Promise<SignInResult> {
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

    const identity: AuthenticatedIdentity = {
      authSubjectId: credential.authSubjectId as AuthSubjectId,
      email: credential.email,
      emailVerified: credential.emailVerified,
    };

    const session: AuthenticationSession = {
      sessionToken: token,
      identity,
      expiresAt: expiresAt.toISOString(),
    };

    return { ok: true, value: session };
  }

  async signOut(sessionToken: string): Promise<Result<void, AuthenticationError>> {
    this.signOutCalls.push(sessionToken);
    this.sessions.delete(sessionToken);
    return { ok: true, value: undefined };
  }

  async getSession(sessionToken: string): Promise<SessionResult> {
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

    const identity: AuthenticatedIdentity = {
      authSubjectId: credential.authSubjectId as AuthSubjectId,
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

  async revokeSession(sessionToken: string): Promise<Result<void, AuthenticationError>> {
    this.revokeCalls.push(sessionToken);
    const session = this.sessions.get(sessionToken);
    if (session) {
      this.sessions.delete(sessionToken);
      this.revokedSubjects.add(session.authSubjectId);
    }
    return { ok: true, value: undefined };
  }

  async verifyEmail(token: string): Promise<EmailVerificationResult> {
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

    const identity: AuthenticatedIdentity = {
      authSubjectId: credential.authSubjectId as AuthSubjectId,
      email: credential.email,
      emailVerified: true,
    };

    return { ok: true, value: identity };
  }

  async generateEmailVerificationToken(authSubjectId: AuthSubjectId): Promise<Result<string, AuthenticationError>> {
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
  clear(): void {
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
