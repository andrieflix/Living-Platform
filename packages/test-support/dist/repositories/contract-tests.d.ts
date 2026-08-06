import type { OrganizationReader, OrganizationCreator } from "@livingsites/application";
export interface RepositoryContractFixtures {
    readonly reader: OrganizationReader;
    readonly creator: OrganizationCreator;
    readonly cleanup: () => Promise<void>;
}
export declare function runRepositoryContractTests(name: string, getFixtures: () => RepositoryContractFixtures): void;
//# sourceMappingURL=contract-tests.d.ts.map