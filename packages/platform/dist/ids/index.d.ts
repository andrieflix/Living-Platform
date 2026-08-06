/**
 * ID generation module — unique identifier generation contract and implementations.
 *
 * Contracts plus platform implementations. Domain and Application receive
 * IdGenerator via injection; they never call crypto.randomUUID() directly.
 */
export declare enum IdFormat {
    Uuid4 = "uuid4",
    Uuid7 = "uuid7",
    Ulid = "ulid",
    Nanoid = "nanoid"
}
export interface IdGenerator {
    generate(format?: IdFormat): string;
    generatePrefixed(prefix: string): string;
}
export { CryptoIdGenerator } from "./crypto-id-generator";
export { DeterministicIdGenerator } from "./deterministic-id-generator";
//# sourceMappingURL=index.d.ts.map