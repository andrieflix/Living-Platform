/**
 * ID generation module — unique identifier generation contract and implementations.
 *
 * Contracts plus platform implementations. Domain and Application receive
 * IdGenerator via injection; they never call crypto.randomUUID() directly.
 */
export var IdFormat;
(function (IdFormat) {
    IdFormat["Uuid4"] = "uuid4";
    IdFormat["Uuid7"] = "uuid7";
    IdFormat["Ulid"] = "ulid";
    IdFormat["Nanoid"] = "nanoid";
})(IdFormat || (IdFormat = {}));
export { CryptoIdGenerator } from "./crypto-id-generator";
export { DeterministicIdGenerator } from "./deterministic-id-generator";
//# sourceMappingURL=index.js.map