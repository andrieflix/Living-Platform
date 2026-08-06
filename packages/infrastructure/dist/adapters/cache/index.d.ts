/**
 * Cache adapter contracts — provider-agnostic key-value cache capability.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { Logger } from "@livingsites/platform";
/** A key-value cache adapter: get, set, delete, expire. */
export interface CacheAdapter {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlMs: number): Promise<void>;
    delete(key: string): Promise<void>;
    deleteByPrefix(prefix: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    readonly logger: Logger;
}
//# sourceMappingURL=index.d.ts.map