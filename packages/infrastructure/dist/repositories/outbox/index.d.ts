/**
 * Outbox adapters — Drizzle-backed event publisher, atomic creation
 * persistence, and outbox processor.
 *
 * Exports only the concrete adapter classes and their config types.
 * Drizzle row types are not exported.
 */
export { OutboxEventPublisher } from "./outbox-event-publisher";
export type { OutboxEventPublisherConfig, OutboxPublishError } from "./outbox-event-publisher";
export { DrizzleOrganizationCreationPersistence } from "./drizzle-organization-creation-persistence";
export type { DrizzleOrganizationCreationPersistenceConfig } from "./drizzle-organization-creation-persistence";
export { DrizzleOutboxProcessor } from "./drizzle-outbox-processor";
export type { OutboxProcessorConfig } from "./drizzle-outbox-processor";
//# sourceMappingURL=index.d.ts.map