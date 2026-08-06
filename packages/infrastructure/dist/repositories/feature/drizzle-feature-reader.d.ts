import type { Logger } from "@livingsites/platform";
import type { Feature, FeatureId, PlanId } from "@livingsites/domain";
import type { FeatureReader } from "@livingsites/application";
import type { DrizzleDB } from "../../db/drizzle-instance";
export interface DrizzleFeatureReaderConfig {
    readonly db: DrizzleDB;
    readonly logger: Logger;
}
export declare class DrizzleFeatureReader implements FeatureReader {
    private readonly db;
    private readonly logger;
    constructor(config: DrizzleFeatureReaderConfig);
    findById(id: FeatureId): Promise<Feature | null>;
    findByKey(key: string): Promise<Feature | null>;
    listForPlan(planId: PlanId): Promise<Feature[]>;
    private reconstructFeature;
}
//# sourceMappingURL=drizzle-feature-reader.d.ts.map