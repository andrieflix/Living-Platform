/**
 * Logging module — structured, leveled logging contract and implementations.
 */
import type { LogLevel } from "../environment";
export type { LogLevel };

export interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly component: string;
  readonly correlationId?: string;
  readonly fields?: Readonly<Record<string, unknown>>;
}

export interface Logger {
  trace(message: string, fields?: Record<string, unknown>): void;
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
  child(name: string): Logger;
  withCorrelationId(id: string): Logger;
  readonly level: LogLevel;
}

export interface LoggerFactory {
  create(name: string): Logger;
}

export { ConsoleLogger } from "./console-logger";
export { NoopLogger } from "./noop-logger";
