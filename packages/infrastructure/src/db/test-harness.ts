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
import type { DrizzleDB } from "./drizzle-instance";

export interface TestDatabaseHarness {
  readonly db: DrizzleDB;
  readonly sqlClient: postgres.Sql;
  readonly netlifyDB: NetlifyDB;
  start(): Promise<void>;
  stop(): Promise<void>;
  reset(): Promise<void>;
}

export async function createTestDatabaseHarness(
  migrationsDir: string = "./netlify/database/migrations",
): Promise<TestDatabaseHarness> {
  const netlifyDB = new NetlifyDB({
    directory: undefined,
    logger: () => {},
  });

  let sqlClient: postgres.Sql;
  let db: DrizzleDB;

  async function start(): Promise<void> {
    const connectionString = await netlifyDB.start();
    await netlifyDB.applyMigrations(migrationsDir);
    sqlClient = postgres(connectionString);
    db = drizzle({ client: sqlClient, schema });
  }

  async function stop(): Promise<void> {
    if (sqlClient) await sqlClient.end();
    await netlifyDB.stop();
  }

  async function reset(): Promise<void> {
    if (!db) return;
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
