/**
 * Clock module — time abstraction for deterministic, testable time.
 *
 * Contracts and platform implementations. Domain and Application receive
 * Clock via injection; they never call Date.now() directly.
 */
export interface Clock {
    /** Current time as an ISO-8601 UTC string. */
    nowIso(): string;
    /** Current time as Unix epoch milliseconds. */
    nowMs(): number;
}
export { SystemClock } from "./system-clock";
export { FakeClock } from "./fake-clock";
//# sourceMappingURL=index.d.ts.map