/**
 * Netlify Database provider — creates a Drizzle client using the
 * drizzle-orm/netlify-db adapter when running inside Netlify.
 *
 * In the Netlify runtime, @netlify/database automatically provides the
 * connection — no manually copied connection string is required.
 *
 * For local development and testing, the caller can pass an explicit
 * connection string (e.g. from NETLIFY_DB_URL or @netlify/database-dev).
 *
 * This module is the ONLY place in the codebase that imports
 * @netlify/database or drizzle-orm/netlify-db. Application and Domain
 * layers never see these types.
 */
import { type NetlifyDbDatabase } from "drizzle-orm/netlify-db";
import * as schema from "../../db/schema";
export type NetlifyDrizzleDB = NetlifyDbDatabase<typeof schema>;
export interface NetlifyDatabaseProviderConfig {
    /**
     * Optional explicit connection string. When provided, used directly
     * (e.g. for local development with @netlify/database-dev).
     * When absent, @netlify/database resolves the connection automatically.
     */
    readonly connectionString?: string;
}
export interface NetlifyDatabaseProvider {
    readonly db: NetlifyDrizzleDB;
    close(): Promise<void>;
}
export declare class MissingNetlifyDatabaseError extends Error {
    constructor(message: string);
}
/**
 * Creates a Drizzle client backed by Netlify Database.
 *
 * In the Netlify runtime, this uses @netlify/database's getDatabase()
 * which returns a server-side pg.Pool connection automatically configured
 * for the current environment (production or deploy preview branch).
 *
 * For local development, pass a connectionString obtained from
 * @netlify/database-dev or NETLIFY_DB_URL.
 */
export declare function createNetlifyDatabase(config?: NetlifyDatabaseProviderConfig): NetlifyDatabaseProvider;
//# sourceMappingURL=index.d.ts.map