/**
 * Composition root — production wiring for Netlify Database.
 *
 * Uses the Netlify Database provider which automatically resolves the
 * connection in the Netlify runtime. No manually copied connection string
 * is required in the normal Netlify runtime.
 *
 * For local development or non-Netlify PostgreSQL, use composePostgresDevelopment
 * which accepts an explicit connection string.
 *
 * Fails fast with a typed error when the database is unavailable.
 * Does NOT automatically run migrations or seeds.
 * Does NOT import test-support.
 */
import { SystemClock, CryptoIdGenerator, ConsoleLogger } from "@livingsites/platform";
import { createNetlifyDatabase, createDbConnection, DrizzleOrganizationRepository, DrizzlePlanReader, DrizzleFeatureReader, OutboxEventPublisher, DrizzleOrganizationCreationPersistence, DrizzleOutboxProcessor, MissingNetlifyDatabaseError, } from "@livingsites/infrastructure";
import { createOrganization } from "@livingsites/application";
export function composeProduction(config = {}) {
    const logger = new ConsoleLogger("app", config.logLevel ?? "info");
    const clock = new SystemClock();
    const idGenerator = new CryptoIdGenerator();
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
    const organizationRepository = new DrizzleOrganizationRepository({ db, logger });
    const planReader = new DrizzlePlanReader({ db, logger });
    const featureReader = new DrizzleFeatureReader({ db, logger });
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
        organizationCreationPersistence,
        outboxProcessor,
        createOrganization,
        createOrganizationDeps,
        healthCheck,
        close,
    };
}
/**
 * Composition root for generic PostgreSQL development.
 *
 * Accepts an explicit connection string. Clearly named as development —
 * NOT for production use. Production uses composeProduction with Netlify Database.
 */
export function composePostgresDevelopment(config) {
    const logger = new ConsoleLogger("app", config.logLevel ?? "debug");
    const clock = new SystemClock();
    const idGenerator = new CryptoIdGenerator();
    const connection = createDbConnection({ url: config.databaseUrl });
    const db = connection.db;
    const organizationRepository = new DrizzleOrganizationRepository({ db, logger });
    const planReader = new DrizzlePlanReader({ db, logger });
    const featureReader = new DrizzleFeatureReader({ db, logger });
    const eventPublisher = new OutboxEventPublisher({ db, logger });
    const organizationCreationPersistence = new DrizzleOrganizationCreationPersistence({ db, logger });
    const outboxProcessor = new DrizzleOutboxProcessor({ db, logger });
    const createOrganizationDeps = {
        organizationRepository,
        planRepository: planReader,
        eventPublisher,
        clock,
        idGenerator,
        organizationCreationPersistence,
    };
    return {
        clock,
        idGenerator,
        logger,
        eventPublisher,
        organizationRepository,
        planReader,
        featureReader,
        organizationCreationPersistence,
        outboxProcessor,
        createOrganization,
        createOrganizationDeps,
        healthCheck: async () => ({ healthy: true, details: { database: true } }),
        close: async () => { await connection.close(); },
    };
}
//# sourceMappingURL=production.js.map