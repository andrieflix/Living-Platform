export class CapturingVerificationEmailAdapter {
    sentEmails = [];
    async sendVerificationEmail(input) {
        this.sentEmails.push({ email: input.email, verificationUrl: input.verificationUrl });
    }
    clear() {
        this.sentEmails.length = 0;
    }
}
//# sourceMappingURL=capturing-verification-email-adapter.js.map