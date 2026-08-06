const LEVEL_ORDER = [
    "trace",
    "debug",
    "info",
    "warn",
    "error",
    "silent",
];
function shouldLog(current, target) {
    if (current === "silent")
        return false;
    const ci = LEVEL_ORDER.indexOf(current);
    const ti = LEVEL_ORDER.indexOf(target);
    return ti >= ci;
}
export class ConsoleLogger {
    level;
    component;
    correlationId;
    constructor(component = "app", level = "info") {
        this.component = component;
        this.level = level;
    }
    trace(message, fields) {
        this.emit("trace", message, fields);
    }
    debug(message, fields) {
        this.emit("debug", message, fields);
    }
    info(message, fields) {
        this.emit("info", message, fields);
    }
    warn(message, fields) {
        this.emit("warn", message, fields);
    }
    error(message, fields) {
        this.emit("error", message, fields);
    }
    child(name) {
        return new ConsoleLogger(`${this.component}:${name}`, this.level);
    }
    withCorrelationId(id) {
        const child = new ConsoleLogger(this.component, this.level);
        child.correlationId = id;
        return child;
    }
    emit(level, message, fields) {
        if (!shouldLog(this.level, level))
            return;
        const entry = {
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
        }
        else {
            process.stdout.write(out + "\n");
        }
    }
}
//# sourceMappingURL=console-logger.js.map