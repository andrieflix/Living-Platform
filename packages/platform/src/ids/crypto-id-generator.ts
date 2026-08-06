/**
 * CryptoIdGenerator — production IdGenerator using Node.js crypto.
 */
import { randomUUID } from "node:crypto";
import type { IdGenerator } from "../index";

export class CryptoIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }

  generatePrefixed(prefix: string): string {
    return `${prefix}_${randomUUID()}`;
  }
}
