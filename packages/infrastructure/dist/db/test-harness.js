/**
 * Local database integration test harness using @netlify/database-dev.
 *
 * Starts a real Postgres-compatible local database, applies migrations,
 * and provides a Drizzle client for integration tests.
 */
import { NetlifyDB } from "@netlify/database-dev";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
export async function createTestDatabaseHarness(migrationsDir = "./netlify/database/migrations") {
    const netlifyDB = new NetlifyDB({
        directory: undefined,
        logger: () => { },
    });
    let sqlClient;
    let db;
    async function start() {
        const connectionString = await netlifyDB.start();
        await netlifyDB.applyMigrations(migrationsDir);
        sqlClient = postgres(connectionString);
        db = drizzle({ client: sqlClient, schema });
    }
    async function stop() {
        if (sqlClient)
            await sqlClient.end();
        await netlifyDB.stop();
    }
    async function reset() {
        if (!db)
            return;
        await db.delete(schema.applicationOutbox);
        await db.delete(schema.planFeatureEntitlements);
        await db.delete(schema.features);
        await db.delete(schema.plans);
        await db.delete(schema.organizations);
    }
    return {
        get db() { return db; },
        get sqlClient() { return sqlClient; },
        get netlifyDB() { return netlifyDB; },
        start,
        stop,
        reset,
    };
}
//# sourceMappingURL=test-harness.js.map