/**
 * Canonical Better Auth instance — server-only.
 *
 * This module creates exactly ONE Better Auth instance using:
 * - Netlify Database (via the composition root)
 * - Drizzle adapter
 * - BETTER_AUTH_SECRET
 * - BETTER_AUTH_URL
 * - trusted origins
 * - email/password auth
 * - session configuration
 * - email verification
 *
 * All auth paths use this same instance:
 * - /api/auth/[...all] route handler
 * - registration (via registerUser use case)
 * - sign-in, sign-out
 * - server session lookup
 * - protected /admin
 *
 * No placeholder wiring. No `null as any`. No second auth instance.
 */
import "server-only";
import { composeProduction } from "@livingsites/composition";
import type { ProductionComposition } from "@livingsites/composition";

let composition: ProductionComposition | null = null;

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getComposition(): ProductionComposition {
  if (!composition) {
    const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? getEnv("BETTER_AUTH_URL"))
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    composition = composeProduction({
      betterAuthSecret: getEnv("BETTER_AUTH_SECRET"),
      betterAuthUrl: getEnv("BETTER_AUTH_URL"),
      trustedOrigins,
      registrationMode: process.env.AUTH_REGISTRATION_MODE ?? "invite_only",
      emailVerificationEnabled: process.env.EMAIL_VERIFICATION_ENABLED === "true",
      logLevel: "info",
    });
  }
  return composition;
}
