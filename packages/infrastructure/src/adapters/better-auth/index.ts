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
import type {
  AuthenticatedIdentity,
  AuthenticationSession,
  AuthenticationError,
  AuthenticationPort,
  RegistrationInput,
  SignInInput,
  RegistrationResult,
  SignInResult,
  SessionResult,
  EmailVerificationResult,
} from "@livingsites/application";
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
    signUpEmail(input: { body: Record<string, unknown> }): Promise<{
      token: string | null;
      user: { id: string; email: string; emailVerified: boolean; name: string };
    } | null>;
    signInEmail(input: { body: Record<string, unknown> }): Promise<{
      token: string;
      user: { id: string; email: string; emailVerified: boolean; name: string };
      redirect: boolean;
    } | null>;
    signOut(input: { headers: Headers }): Promise<{ status: boolean }>;
    getSession(input: { headers: Headers }): Promise<{
      session: { token: string; expiresAt: Date };
      user: { id: string; email: string; emailVerified: boolean; name: string };
    } | null>;
    revokeSession(input: { body: Record<string, unknown>; headers: Headers }): Promise<unknown>;
    verifyEmail(input: { query: { token: string } }): Promise<{ status: boolean } | null>;
    sendVerificationEmail(input: { body: Record<string, unknown> }): Promise<unknown>;
  };
}

export interface BetterAuthAdapterConfig {
  readonly auth: BetterAuthInstance;
  readonly logger: Logger;
}

function mapAuthError(err: unknown): AuthenticationError {
  const e = err as Record<string, unknown>;
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

function toIdentity(user: { id: string; email: string; emailVerified: boolean }): AuthenticatedIdentity {
  return {
    authSubjectId: user.id as AuthenticatedIdentity["authSubjectId"],
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
  };
}

function toSession(token: string, user: { id: string; email: string; emailVerified: boolean }, expiresAt: Date): AuthenticationSession {
  return {
    sessionToken: token,
    identity: toIdentity(user),
    expiresAt: expiresAt instanceof Date ? expiresAt.toISOString() : String(expiresAt),
  };
}

export class BetterAuthAdapter implements AuthenticationPort {
  private readonly _auth: BetterAuthInstance;
  private readonly logger: Logger;

  constructor(config: BetterAuthAdapterConfig) {
    this._auth = config.auth;
    this.logger = config.logger;
  }

  get auth(): BetterAuthInstance {
    return this._auth;
  }

  async registerWithEmail(input: RegistrationInput): Promise<RegistrationResult> {
    try {
      const result = await this._auth.api.signUpEmail({
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
    } catch (err) {
      this.logger.error("registerWithEmail failed", { error: String(err) });
      return { ok: false, error: mapAuthError(err) };
    }
  }

  async signInWithEmail(input: SignInInput): Promise<SignInResult> {
    try {
      const result = await this._auth.api.signInEmail({
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
    } catch (err) {
      this.logger.error("signInWithEmail failed", { error: String(err) });
      return { ok: false, error: mapAuthError(err) };
    }
  }

  async signOut(sessionToken: string): Promise<Result<void, AuthenticationError>> {
    try {
      await this._auth.api.signOut({
        headers: new Headers({ authorization: `Bearer ${sessionToken}` }),
      });
      return { ok: true, value: undefined };
    } catch (err) {
      this.logger.error("signOut failed", { error: String(err) });
      return { ok: false, error: { code: "session_not_found", message: "Session not found or already expired." } };
    }
  }

  async getSession(sessionToken: string): Promise<SessionResult> {
    try {
      const result = await this._auth.api.getSession({
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
    } catch (err) {
      this.logger.error("getSession failed", { error: String(err) });
      return { ok: false, error: { code: "session_not_found", message: "Session lookup failed." } };
    }
  }

  async revokeSession(sessionToken: string): Promise<Result<void, AuthenticationError>> {
    try {
      await this._auth.api.revokeSession({
        body: { token: sessionToken },
        headers: new Headers({ authorization: `Bearer ${sessionToken}` }),
      });
      return { ok: true, value: undefined };
    } catch (err) {
      this.logger.error("revokeSession failed", { error: String(err) });
      return { ok: false, error: { code: "session_not_found", message: "Session could not be revoked." } };
    }
  }

  async verifyEmail(token: string): Promise<EmailVerificationResult> {
    try {
      const result = await this._auth.api.verifyEmail({
        query: { token },
      });

      if (!result || !result.status) {
        return { ok: false, error: { code: "verification_failed", message: "Email verification failed." } };
      }

      const identity: AuthenticatedIdentity = {
        authSubjectId: "" as AuthSubjectId,
        email: "",
        emailVerified: true,
      };

      return { ok: true, value: identity };
    } catch (err) {
      this.logger.error("verifyEmail failed", { error: String(err) });
      const e = err as Record<string, unknown>;
      if (e && typeof e.message === "string" && /expired/i.test(e.message)) {
        return { ok: false, error: { code: "verification_token_expired", message: "Verification token has expired." } };
      }
      return { ok: false, error: { code: "verification_failed", message: "Email verification failed." } };
    }
  }

  async generateEmailVerificationToken(authSubjectId: AuthSubjectId): Promise<Result<string, AuthenticationError>> {
    try {
      await this._auth.api.sendVerificationEmail({
        body: { email: String(authSubjectId) },
      });
      return { ok: true, value: "" };
    } catch (err) {
      this.logger.error("generateEmailVerificationToken failed", { error: String(err) });
      return { ok: false, error: { code: "identity_provider_failure", message: "Failed to generate verification token." } };
    }
  }
}
