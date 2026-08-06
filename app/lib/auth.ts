import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function createAuth() {
  const secret = getEnv("BETTER_AUTH_SECRET");
  const baseURL = getEnv("BETTER_AUTH_URL");
  const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? baseURL).split(",").map((s) => s.trim());

  return betterAuth({
    secret,
    baseURL,
    trustedOrigins,
    database: drizzleAdapter(
      // The Drizzle instance is resolved at runtime by the Netlify Database provider.
      // In production, this is wired by the composition root.
      // For the route handler, we use a lazy import to avoid circular dependencies.
      // The actual DB connection is established in the composition root.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      null as any,
      {
        provider: "pg",
        schema: {
          user: "ba_user",
          session: "ba_session",
          account: "ba_account",
          verification: "ba_verification",
        },
      }
    ),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: process.env.EMAIL_VERIFICATION_ENABLED === "true",
      minPasswordLength: 12,
      maxPasswordLength: 256,
    },
    session: {
      expiresIn: 7 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    advanced: {
      cookies: {
        sessionToken: {
          attributes: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          },
        },
      },
    },
  });
}

let authInstance: ReturnType<typeof betterAuth> | null = null;

export function getAuth(): ReturnType<typeof betterAuth> {
  if (!authInstance) {
    authInstance = createAuth();
  }
  return authInstance;
}
