import type { Logger } from "@livingsites/platform";
import type { OutboxProcessor, OutboxEventRecord, DispatchOutcome } from "@livingsites/application";
import type { DrizzleDB } from "../../db/drizzle-instance";
export interface OutboxProcessorConfig {
    readonly db: DrizzleDB;
    readonly logger: Logger;
    readonly maxAttempts?: number;
    readonly baseBackoffMs?: number;
    readonly maxBackoffMs?: number;
}
type Handler = (event: OutboxEventRecord) => Promise<DispatchOutcome>;
export declare class DrizzleOutboxProcessor implements OutboxProcessor {
    private readonly db;
    private readonly logger;
    private readonly maxAttempts;
    private readonly baseBackoffMs;
    private readonly maxBackoffMs;
    private readonly handlers;
    constructor(config: OutboxProcessorConfig);
    registerHandler(eventType: string, handler: Handler): void;
    processBatch(batchSize?: number): Promise<number>;
    private claimPending;
    private processSingle;
    private markProcessed;
    private markFailed;
    private calculateBackoff;
}
export {};
//# sourceMappingURL=drizzle-outbox-processor.d.ts.map