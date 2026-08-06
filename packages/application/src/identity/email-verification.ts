/**
 * Provider-independent email-verification notification port.
 *
 * Production composition must supply a real email-delivery implementation.
 * No production no-op sender is allowed. Test-support provides a capturing
 * adapter for unit tests.
 */
export interface EmailVerificationPort {
  /**
   * Send a verification email to the given address with the given verification URL.
   * The URL must use a trusted origin.
   */
  sendVerificationEmail(input: {
    readonly email: string;
    readonly verificationUrl: string;
  }): Promise<void>;
}

/**
 * Configuration for the verification URL builder.
 * The verification URL must use a trusted origin.
 */
export interface VerificationUrlConfig {
  readonly trustedOrigin: string;
  readonly verificationPath: string;
}

export function buildVerificationUrl(config: VerificationUrlConfig, token: string): string {
  const base = config.trustedOrigin.replace(/\/+$/, "");
  const path = config.verificationPath.replace(/^\/+/, "");
  return `${base}/${path}?token=${encodeURIComponent(token)}`;
}
