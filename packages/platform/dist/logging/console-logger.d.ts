/**
 * ConsoleLogger — structured logger that writes to the console.
 */
import type { Logger, LogLevel } from "../index";
export declare class ConsoleLogger implements Logger {
    readonly level: LogLevel;
    private readonly component;
    private correlationId?;
    constructor(component?: string, level?: LogLevel);
    trace(message: string, fields?: Record<string, unknown>): void;
    debug(message: string, fields?: Record<string, unknown>): void;
    info(message: string, fields?: Record<string, unknown>): void;
    warn(message: string, fields?: Record<string, unknown>): void;
    error(message: string, fields?: Record<string, unknown>): void;
    child(name: string): Logger;
    withCorrelationId(id: string): Logger;
    private emit;
}
//# sourceMappingURL=console-logger.d.ts.map