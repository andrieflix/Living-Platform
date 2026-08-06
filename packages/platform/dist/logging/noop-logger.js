export class NoopLogger {
    level;
    constructor(level = "silent") {
        this.level = level;
    }
    trace() { }
    debug() { }
    info() { }
    warn() { }
    error() { }
    child() {
        return this;
    }
    withCorrelationId() {
        return this;
    }
}
//# sourceMappingURL=noop-logger.js.map