/**
 * Local database integration test harness using @netlify/database-dev.
 *
 * Starts a real Postgres-compatible local database, applies migrations,
 * and provides a Drizzle client for integration tests.
 */
import { NetlifyDB } from "@netlify/database-dev";
import postgres from "postgres";
import type { DrizzleDB } from "./drizzle-instance";
export interface TestDatabaseHarness {
    readonly db: DrizzleDB;
    readonly sqlClient: postgres.Sql;
    readonly netlifyDB: NetlifyDB;
    start(): Promise<void>;
    stop(): Promise<void>;
    reset(): Promise<void>;
}
export declare function createTestDatabaseHarness(migrationsDir?: string): Promise<TestDatabaseHarness>;
//# sourceMappingURL=test-harness.d.ts.map