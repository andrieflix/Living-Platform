/**
 * FakeClock — deterministic Clock for tests.
 */
import type { Clock } from "../index";
export declare class FakeClock implements Clock {
    private currentMs;
    constructor(initialMs?: number);
    nowIso(): string;
    nowMs(): number;
    advance(deltaMs: number): void;
    set(ms: number): void;
}
//# sourceMappingURL=fake-clock.d.ts.map