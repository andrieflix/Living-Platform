/**
 * Explicit no-op event publisher for development composition.
 * This is NOT for production — it must be explicitly selected by
 * composeDevelopment and documented.
 */
export class NoopEventPublisher {
    async publish() { }
    async publishAll() { }
}
export { FakeClock, DeterministicIdGenerator } from "@livingsites/platform";
//# sourceMappingURL=test-runtime.js.map