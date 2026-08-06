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
import { drizzle } from "./drizzle-instance";
export function createDbConnection(config) {
    const db = drizzle(config.url);
    return {
        db,
        async close() {
            // The postgres driver manages its own pool; closing is handled by the caller.
        },
    };
}
//# sourceMappingURL=connection.js.map