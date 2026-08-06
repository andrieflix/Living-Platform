/**
 * DeterministicIdGenerator — deterministic IdGenerator for tests.
 */
import type { IdGenerator } from "../index";
export declare class DeterministicIdGenerator implements IdGenerator {
    private counter;
    generate(): string;
    generatePrefixed(prefix: string): string;
    reset(): void;
}
//# sourceMappingURL=deterministic-id-generator.d.ts.map