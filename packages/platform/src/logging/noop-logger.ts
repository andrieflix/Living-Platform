/**
 * NoopLogger — discards all log output.
 */
import type { Logger, LogEntry, LogLevel } from "../index";

export class NoopLogger implements Logger {
  readonly level: LogLevel;

  constructor(level: LogLevel = "silent") {
    this.level = level;
  }

  trace(): void {}
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
  child(): Logger {
    return this;
  }
  withCorrelationId(): Logger {
    return this;
  }
}

export type { LogEntry };
