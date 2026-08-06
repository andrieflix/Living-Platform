/**
 * CryptoIdGenerator — production IdGenerator using Node.js crypto.
 */
import { randomUUID } from "node:crypto";
export class CryptoIdGenerator {
    generate() {
        return randomUUID();
    }
    generatePrefixed(prefix) {
        return `${prefix}_${randomUUID()}`;
    }
}
//# sourceMappingURL=crypto-id-generator.js.map