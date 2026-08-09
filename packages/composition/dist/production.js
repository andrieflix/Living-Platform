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
import { createNetlifyDatabase, DrizzleOrganizationRepository, DrizzlePlanReader, DrizzleFeatureReader, DrizzleUserRepository, BetterAuthAdapter, asBetterAuthInstance, OutboxEventPublisher, DrizzleOrganizationCreationPersistence, DrizzleOutboxProcessor, MissingNetlifyDatabaseError, } from "@livingsites/infrastructure";
import { createOrganization, registerUser, parseRegistrationMode, DEFAULT_PRODUCTION_REGISTRATION_MODE, } from "@livingsites/application";
function validateConfig(config) {
    if (!config.betterAuthSecret || config.betterAuthSecret.length < 32) {
        throw new Error("BETTER_AUTH_SECRET is missing or too short (minimum 32 characters). " +
            "Set it in your environment configuration.");
    }
    if (!config.betterAuthUrl) {
        throw new Error("BETTER_AUTH_URL is missing. Set it to your application's base URL.");
    }
    try {
        new URL(config.betterAuthUrl);
    }
    catch {
        throw new Error(`BETTER_AUTH_URL is not a valid URL: ${config.betterAuthUrl}`);
    }
    if (!config.trustedOrigins || config.trustedOrigins.length === 0) {
        throw new Error("At least one trusted origin must be configured.");
    }
    for (const origin of config.trustedOrigins) {
        try {
            new URL(origin);
        }
        catch {
            throw new Error(`Trusted origin is not a valid URL: ${origin}`);
        }
    }
    if (config.emailVerificationEnabled && !config.emailAdapter) {
        throw new Error("Email verification is enabled but no EmailAdapter is configured. " +
            "Production cannot silently discard verification emails. " +
            "Provide an EmailAdapter or disable email verification.");
    }
}
export function composeProduction(config) {
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
    }
    catch (err) {
        if (err instanceof MissingNetlifyDatabaseError) {
            throw err;
        }
        throw new MissingNetlifyDatabaseError(`Failed to initialize Netlify Database: ${err instanceof Error ? err.message : String(err)}`);
    }
    const db = connection.db;
    const rawAuth = betterAuth({
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
    const authInstance = asBetterAuthInstance(rawAuth);
    const authAdapter = new BetterAuthAdapter({ auth: authInstance, logger });
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
    const createOrganizationDeps = {
        organizationRepository,
        planRepository: planReader,
        eventPublisher,
        clock,
        idGenerator,
        organizationCreationPersistence,
    };
    const registerUserDeps = {
        authenticationPort: authAdapter,
        userReader: userRepository,
        userCreator: userRepository,
        eventPublisher,
        clock,
        idGenerator,
        registrationMode,
    };
    const healthCheck = async () => {
        const details = {};
        let healthy = true;
        try {
            await db.execute("SELECT 1");
            details.database = true;
        }
        catch {
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
        authenticationPort: authAdapter,
        authInstance,
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
//# sourceMappingURL=production.js.map