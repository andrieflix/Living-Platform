export class FakeClock {
    currentMs;
    constructor(initialMs = 0) {
        this.currentMs = initialMs;
    }
    nowIso() {
        return new Date(this.currentMs).toISOString();
    }
    nowMs() {
        return this.currentMs;
    }
    advance(deltaMs) {
        this.currentMs += deltaMs;
    }
    set(ms) {
        this.currentMs = ms;
    }
}
//# sourceMappingURL=fake-clock.js.map