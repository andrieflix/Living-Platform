/**
 * ConsoleLogger — structured logger that writes to the console.
 */
import type { Logger, LogEntry, LogLevel } from "../index";

const LEVEL_ORDER: readonly LogLevel[] = [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "silent",
];

function shouldLog(current: LogLevel, target: LogLevel): boolean {
  if (current === "silent") return false;
  const ci = LEVEL_ORDER.indexOf(current);
  const ti = LEVEL_ORDER.indexOf(target);
  return ti >= ci;
}

export class ConsoleLogger implements Logger {
  readonly level: LogLevel;
  private readonly component: string;
  private correlationId?: string;

  constructor(component: string = "app", level: LogLevel = "info") {
    this.component = component;
    this.level = level;
  }

  trace(message: string, fields?: Record<string, unknown>): void {
    this.emit("trace", message, fields);
  }
  debug(message: string, fields?: Record<string, unknown>): void {
    this.emit("debug", message, fields);
  }
  info(message: string, fields?: Record<string, unknown>): void {
    this.emit("info", message, fields);
  }
  warn(message: string, fields?: Record<string, unknown>): void {
    this.emit("warn", message, fields);
  }
  error(message: string, fields?: Record<string, unknown>): void {
    this.emit("error", message, fields);
  }

  child(name: string): Logger {
    return new ConsoleLogger(`${this.component}:${name}`, this.level);
  }

  withCorrelationId(id: string): Logger {
    const child = new ConsoleLogger(this.component, this.level);
    child.correlationId = id;
    return child;
  }

  private emit(level: LogLevel, message: string, fields?: Record<string, unknown>): void {
    if (!shouldLog(this.level, level)) return;
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component: this.component,
      ...(this.correlationId !== undefined ? { correlationId: this.correlationId } : {}),
      ...(fields !== undefined ? { fields } : {}),
    };
    const out = JSON.stringify(entry);
    if (level === "error" || level === "warn") {
      process.stderr.write(out + "\n");
    } else {
      process.stdout.write(out + "\n");
    }
  }
}
