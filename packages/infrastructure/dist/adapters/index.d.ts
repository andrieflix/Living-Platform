/**
 * Adapter contracts barrel.
 *
 * Each adapter represents a provider capability — what a provider can do
 * without naming a specific provider. The composition root selects which
 * concrete implementation to bind to each adapter.
 */
export * from "./database";
export * from "./storage";
export * from "./search";
export * from "./email";
export * from "./cache";
export * from "./queue";
export * from "./telemetry";
export * from "./logging";
//# sourceMappingURL=index.d.ts.map