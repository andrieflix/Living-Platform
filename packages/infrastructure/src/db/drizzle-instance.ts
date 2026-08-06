/**
 * Drizzle instance factory and shared type.
 *
 * Uses the postgres-js driver for generic PostgreSQL connections.
 * For Netlify Database, use the NetlifyDatabaseProvider which uses
 * drizzle-orm/netlify-db.
 *
 * The DrizzleDB type is intentionally generic to accept both
 * postgres-js and netlify-db Drizzle instances.
 */
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/** Shared Drizzle database type — accepts both postgres-js and netlify-db clients. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DrizzleDB = any;

export function createDrizzle(url: string): DrizzleDB {
  return drizzlePg(url, { schema });
}

export { createDrizzle as drizzle };
