/**
 * Shared infrastructure contracts used by all repository adapters.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { Logger } from "@livingsites/platform";
/** Common lifecycle for all database-backed repository adapters. */
export interface DatabaseBackedAdapter {
    /** Initialize the adapter (open connections, prepare statements). Called at startup. */
    initialize(): Promise<void>;
    /** Check whether the underlying provider is reachable. Called by health checks. */
    healthCheck(): Promise<boolean>;
    /** Close the adapter (release connections). Called at shutdown. */
    close(): Promise<void>;
    /** The logger injected by the composition root. */
    readonly logger: Logger;
}
//# sourceMappingURL=shared.d.ts.map