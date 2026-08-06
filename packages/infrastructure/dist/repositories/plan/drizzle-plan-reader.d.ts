import type { Logger } from "@livingsites/platform";
import type { Plan, PlanId } from "@livingsites/domain";
import type { PlanReader } from "@livingsites/application";
import type { DrizzleDB } from "../../db/drizzle-instance";
export interface DrizzlePlanReaderConfig {
    readonly db: DrizzleDB;
    readonly logger: Logger;
}
export declare class DrizzlePlanReader implements PlanReader {
    private readonly db;
    private readonly logger;
    constructor(config: DrizzlePlanReaderConfig);
    findById(id: PlanId): Promise<Plan | null>;
    findActiveById(id: PlanId): Promise<Plan | null>;
    listActive(): Promise<Plan[]>;
    private reconstructPlan;
}
//# sourceMappingURL=drizzle-plan-reader.d.ts.map