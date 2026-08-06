/** Redacts known secret fields from a log entry before forwarding. */
export function redactSecrets(entry, secretFields) {
    if (!entry.fields)
        return entry;
    const redacted = {};
    for (const [key, value] of Object.entries(entry.fields)) {
        redacted[key] = secretFields.includes(key) ? "[REDACTED]" : value;
    }
    return { ...entry, fields: redacted };
}
//# sourceMappingURL=index.js.map