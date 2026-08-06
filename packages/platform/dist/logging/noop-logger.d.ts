/**
 * NoopLogger — discards all log output.
 */
import type { Logger, LogEntry, LogLevel } from "../index";
export declare class NoopLogger implements Logger {
    readonly level: LogLevel;
    constructor(level?: LogLevel);
    trace(): void;
    debug(): void;
    info(): void;
    warn(): void;
    error(): void;
    child(): Logger;
    withCorrelationId(): Logger;
}
export type { LogEntry };
//# sourceMappingURL=noop-logger.d.ts.map