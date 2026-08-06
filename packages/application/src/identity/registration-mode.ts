/**
 * Registration mode configuration.
 *
 * Controls whether public registration is open, invite-only, or disabled.
 * Enforced server-side by the RegisterUser use case — changing UI visibility
 * alone is insufficient.
 */
export type RegistrationMode = "open" | "invite_only" | "disabled";

export const DEFAULT_DEVELOPMENT_REGISTRATION_MODE: RegistrationMode = "open";
export const DEFAULT_PRODUCTION_REGISTRATION_MODE: RegistrationMode = "invite_only";

export function parseRegistrationMode(value: string | undefined): RegistrationMode {
  if (value === "open" || value === "invite_only" || value === "disabled") {
    return value;
  }
  return DEFAULT_PRODUCTION_REGISTRATION_MODE;
}
