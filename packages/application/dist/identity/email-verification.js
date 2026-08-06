export function buildVerificationUrl(config, token) {
    const base = config.trustedOrigin.replace(/\/+$/, "");
    const path = config.verificationPath.replace(/^\/+/, "");
    return `${base}/${path}?token=${encodeURIComponent(token)}`;
}
//# sourceMappingURL=email-verification.js.map