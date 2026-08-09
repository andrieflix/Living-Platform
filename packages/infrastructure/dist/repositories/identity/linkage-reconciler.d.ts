import type { Logger } from "@livingsites/platform";
import type { DrizzleDB } from "../../db/drizzle-instance";
import type { UserCreator } from "@livingsites/application";
export interface LinkageReconcilerConfig {
    readonly db: DrizzleDB;
    readonly logger: Logger;
    readonly userCreator: UserCreator;
    readonly idGenerator: {
        generatePrefixed(prefix: string): string;
    };
    readonly clock: {
        nowIso(): string;
    };
    readonly batchSize?: number;
}
export interface ReconciliationResult {
    readonly processed: number;
    readonly linked: number;
    readonly failed: number;
    readonly skipped: number;
}
export declare class LinkageReconciler {
    private readonly db;
    private readonly logger;
    private readonly userCreator;
    private readonly idGenerator;
    private readonly clock;
    private readonly batchSize;
    constructor(config: LinkageReconcilerConfig);
    reconcile(): Promise<ReconciliationResult>;
    private processLinkage;
}
//# sourceMappingURL=linkage-reconciler.d.ts.map