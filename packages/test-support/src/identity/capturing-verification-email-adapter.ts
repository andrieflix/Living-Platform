/**
 * Capturing email verification adapter for tests.
 *
 * Captures verification emails for assertion without sending them.
 * NOT for production use.
 */
import type { EmailVerificationPort } from "@livingsites/application";

export class CapturingVerificationEmailAdapter implements EmailVerificationPort {
  readonly sentEmails: { email: string; verificationUrl: string }[] = [];

  async sendVerificationEmail(input: {
    readonly email: string;
    readonly verificationUrl: string;
  }): Promise<void> {
    this.sentEmails.push({ email: input.email, verificationUrl: input.verificationUrl });
  }

  clear(): void {
    this.sentEmails.length = 0;
  }
}
