/**
 * Registration mode configuration.
 *
 * Controls whether public registration is open, invite-only, or disabled.
 * Enforced server-side by the RegisterUser use case — changing UI visibility
 * alone is insufficient.
 */
export type RegistrationMode = "open" | "invite_only" | "disabled";
export declare const DEFAULT_DEVELOPMENT_REGISTRATION_MODE: RegistrationMode;
export declare const DEFAULT_PRODUCTION_REGISTRATION_MODE: RegistrationMode;
export declare function parseRegistrationMode(value: string | undefined): RegistrationMode;
//# sourceMappingURL=registration-mode.d.ts.map