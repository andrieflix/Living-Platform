/**
 * Composition root — production wiring for Netlify Database + Better Auth.
 *
 * Uses the Netlify Database provider which automatically resolves the
 * connection in the Netlify runtime. Better Auth is configured with
 * the Drizzle adapter backed by the same database.
 *
 * Fails fast on missing BETTER_AUTH_SECRET.
 * Fails fast on invalid BETTER_AUTH_URL or trusted origins.
 * Fails fast when email delivery is enabled but no EmailAdapter is configured.
 * Does NOT import test-support.
 * Does NOT contain in-memory authentication storage.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { SystemClock, CryptoIdGenerator, ConsoleLogger } from "@livingsites/platform";
import type { Clock, IdGenerator, Logger } from "@livingsites/platform";
import {
  createNetlifyDatabase,
  DrizzleOrganizationRepository,
  DrizzlePlanReader,
  DrizzleFeatureReader,
  DrizzleUserRepository,
  BetterAuthAdapter,
  OutboxEventPublisher,
  DrizzleOrganizationCreationPersistence,
  DrizzleOutboxProcessor,
  MissingNetlifyDatabaseError,
} from "@livingsites/infrastructure";
import type {
  OrganizationReader,
  OrganizationCreator,
  PlanReader,
  FeatureReader,
  UserReader,
  UserCreator,
  EventPublisher,
  OrganizationCreationPersistence,
  OutboxProcessor,
  AuthenticationPort,
  EmailVerificationPort,
  RegistrationMode,
} from "@livingsites/application";
import {
  createOrganization,
  registerUser,
  parseRegistrationMode,
  DEFAULT_PRODUCTION_REGISTRATION_MODE,
} from "@livingsites/application";
import type { CreateOrganizationDeps, RegisterUserDeps } from "@livingsites/application";

export interface ProductionCompositionConfig {
  readonly connectionString?: string;
  readonly logLevel?: "trace" | "debug" | "info" | "warn" | "error" | "silent";
  readonly outboxMaxAttempts?: number;
  readonly outboxBaseBackoffMs?: number;
  readonly outboxMaxBackoffMs?: number;
  readonly betterAuthSecret: string;
  readonly betterAuthUrl: string;
  readonly trustedOrigins: readonly string[];
  readonly registrationMode?: string;
  readonly emailVerificationEnabled?: boolean;
  readonly emailAdapter?: EmailVerificationPort;
}

export interface ProductionComposition {
  readonly clock: Clock;
  readonly idGenerator: IdGenerator;
  readonly logger: Logger;
  readonly eventPublisher: EventPublisher;
  readonly organizationRepository: OrganizationReader & OrganizationCreator;
  readonly planReader: PlanReader;
  readonly featureReader: FeatureReader;
  readonly userReader: UserReader;
  readonly userCreator: UserCreator;
  readonly authenticationPort: AuthenticationPort;
  readonly emailVerificationPort: EmailVerificationPort | null;
  readonly organizationCreationPersistence: OrganizationCreationPersistence;
  readonly outboxProcessor: OutboxProcessor;
  readonly createOrganization: typeof createOrganization;
  readonly createOrganizationDeps: CreateOrganizationDeps;
  readonly registerUser: typeof registerUser;
  readonly registerUserDeps: RegisterUserDeps;
  readonly registrationMode: RegistrationMode;
  readonly healthCheck: () => Promise<{ healthy: boolean; details: Record<string, boolean> }>;
  readonly close: () => Promise<void>;
}

function validateConfig(config: ProductionCompositionConfig): void {
  if (!config.betterAuthSecret || config.betterAuthSecret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET is missing or too short (minimum 32 characters). " +
        "Set it in your environment configuration.",
    );
  }
  if (!config.betterAuthUrl) {
    throw new Error("BETTER_AUTH_URL is missing. Set it to your application's base URL.");
  }
  try {
    new URL(config.betterAuthUrl);
  } catch {
    throw new Error(`BETTER_AUTH_URL is not a valid URL: ${config.betterAuthUrl}`);
  }
  if (!config.trustedOrigins || config.trustedOrigins.length === 0) {
    throw new Error("At least one trusted origin must be configured.");
  }
  for (const origin of config.trustedOrigins) {
    try {
      new URL(origin);
    } catch {
      throw new Error(`Trusted origin is not a valid URL: ${origin}`);
    }
  }
  if (config.emailVerificationEnabled && !config.emailAdapter) {
    throw new Error(
      "Email verification is enabled but no EmailAdapter is configured. " +
        "Production cannot silently discard verification emails. " +
        "Provide an EmailAdapter or disable email verification.",
    );
  }
}

export function composeProduction(
  config: ProductionCompositionConfig,
): ProductionComposition {
  validateConfig(config);

  const logger = new ConsoleLogger("app", config.logLevel ?? "info");
  const clock = new SystemClock();
  const idGenerator = new CryptoIdGenerator();
  const registrationMode = parseRegistrationMode(config.registrationMode) ?? DEFAULT_PRODUCTION_REGISTRATION_MODE;

  let connection;
  try {
    connection = createNetlifyDatabase({
      ...(config.connectionString ? { connectionString: config.connectionString } : {}),
    });
  } catch (err) {
    if (err instanceof MissingNetlifyDatabaseError) {
      throw err;
    }
    throw new MissingNetlifyDatabaseError(
      `Failed to initialize Netlify Database: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const db = connection.db;

  const auth = betterAuth({
    secret: config.betterAuthSecret,
    baseURL: config.betterAuthUrl,
    trustedOrigins: [...config.trustedOrigins],
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: "ba_user",
        session: "ba_session",
        account: "ba_account",
        verification: "ba_verification",
      },
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: config.emailVerificationEnabled ?? false,
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
            secure: true,
            sameSite: "lax",
          },
        },
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authenticationPort = new BetterAuthAdapter({ auth: auth as any, logger });
  const organizationRepository = new DrizzleOrganizationRepository({ db, logger });
  const planReader = new DrizzlePlanReader({ db, logger });
  const featureReader = new DrizzleFeatureReader({ db, logger });
  const userRepository = new DrizzleUserRepository({ db, logger });
  const eventPublisher = new OutboxEventPublisher({ db, logger });
  const organizationCreationPersistence = new DrizzleOrganizationCreationPersistence({ db, logger });
  const outboxProcessor = new DrizzleOutboxProcessor({
    db,
    logger,
    maxAttempts: config.outboxMaxAttempts,
    baseBackoffMs: config.outboxBaseBackoffMs,
    maxBackoffMs: config.outboxMaxBackoffMs,
  });

  const createOrganizationDeps: CreateOrganizationDeps = {
    organizationRepository,
    planRepository: planReader,
    eventPublisher,
    clock,
    idGenerator,
    organizationCreationPersistence,
  };

  const registerUserDeps: RegisterUserDeps = {
    authenticationPort,
    userReader: userRepository,
    userCreator: userRepository,
    eventPublisher,
    clock,
    idGenerator,
    registrationMode,
  };

  const healthCheck = async () => {
    const details: Record<string, boolean> = {};
    let healthy = true;
    try {
      await db.execute("SELECT 1" as unknown as never);
      details.database = true;
    } catch {
      details.database = false;
      healthy = false;
    }
    details.authentication = true;
    details.userRepository = true;
    details.planReader = true;
    details.featureReader = true;
    details.eventPublisher = true;
    details.outboxProcessor = true;
    return { healthy, details };
  };

  const close = async () => {
    await connection.close();
  };

  return {
    clock,
    idGenerator,
    logger,
    eventPublisher,
    organizationRepository,
    planReader,
    featureReader,
    userReader: userRepository,
    userCreator: userRepository,
    authenticationPort,
    emailVerificationPort: config.emailAdapter ?? null,
    organizationCreationPersistence,
    outboxProcessor,
    createOrganization,
    createOrganizationDeps,
    registerUser,
    registerUserDeps,
    registrationMode,
    healthCheck,
    close,
  };
}
