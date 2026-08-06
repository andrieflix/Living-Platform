/**
 * Database connection abstraction.
 *
 * Creates a Drizzle instance from an injected connection string. The raw
 * database client is never exported outside Infrastructure. Application
 * and UI packages never see Drizzle types.
 *
 * The adapter is portable to any PostgreSQL-compatible connection string,
 * including future Netlify DB deployments.
 */
import { type DrizzleDB } from "./drizzle-instance";
export interface DatabaseConfig {
    readonly url: string;
}
export interface DbConnection {
    readonly db: DrizzleDB;
    close(): Promise<void>;
}
export declare function createDbConnection(config: DatabaseConfig): DbConnection;
//# sourceMappingURL=connection.d.ts.map