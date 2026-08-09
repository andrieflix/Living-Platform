/**
 * Cast a `betterAuth()` return value to the structural `BetterAuthInstance`.
 * This is safe because `betterAuth()` returns an object that structurally
 * satisfies our interface. The cast avoids the generic-incompatibility
 * between `Auth<SpecificOptions>` and `Auth<BetterAuthOptions>`.
 */
export function asBetterAuthInstance(auth) {
    return auth;
}
//# sourceMappingURL=cast.js.map