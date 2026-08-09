/**
 * Capturing email verification adapter for tests.
 *
 * Captures verification emails for assertion without sending them.
 * NOT for production use.
 */
import type { EmailVerificationPort } from "@livingsites/application";
export declare class CapturingVerificationEmailAdapter implements EmailVerificationPort {
    readonly sentEmails: {
        email: string;
        verificationUrl: string;
    }[];
    sendVerificationEmail(input: {
        readonly email: string;
        readonly verificationUrl: string;
    }): Promise<void>;
    clear(): void;
}
//# sourceMappingURL=capturing-verification-email-adapter.d.ts.map