/**
 * DeterministicIdGenerator — deterministic IdGenerator for tests.
 */
import type { IdGenerator } from "../index";

export class DeterministicIdGenerator implements IdGenerator {
  private counter: number = 0;

  generate(): string {
    this.counter += 1;
    return `id-${this.counter.toString().padStart(4, "0")}`;
  }

  generatePrefixed(prefix: string): string {
    this.counter += 1;
    return `${prefix}_${this.counter.toString().padStart(4, "0")}`;
  }

  reset(): void {
    this.counter = 0;
  }
}
