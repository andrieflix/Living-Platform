import type { Plan, Feature, PlanId } from "@livingsites/domain";
import type { PlanReader, FeatureReader, OutboxReader } from "@livingsites/application";
export interface PlanReaderContractFixtures {
    readonly reader: PlanReader;
    readonly seedPlans: readonly Plan[];
    readonly cleanup: () => Promise<void>;
}
export declare function runPlanReaderContractTests(name: string, getFixtures: () => PlanReaderContractFixtures): void;
export interface FeatureReaderContractFixtures {
    readonly reader: FeatureReader;
    readonly seedFeatures: readonly Feature[];
    readonly seedPlanId: PlanId;
    readonly seedEntitlementCount: number;
    readonly cleanup: () => Promise<void>;
}
export declare function runFeatureReaderContractTests(name: string, getFixtures: () => FeatureReaderContractFixtures): void;
export interface OutboxContractFixtures {
    readonly reader: OutboxReader;
    readonly createEvent: (aggregateId: string) => Promise<{
        id: string;
        idempotencyKey: string;
    }>;
    readonly cleanup: () => Promise<void>;
}
export declare function runOutboxContractTests(name: string, getFixtures: () => OutboxContractFixtures): void;
//# sourceMappingURL=plan-feature-outbox-contract-tests.d.ts.map