import type { UserReader, UserCreator } from "@livingsites/application";
export interface UserRepositoryContractFixtures {
    readonly reader: UserReader;
    readonly creator: UserCreator;
    readonly cleanup: () => Promise<void>;
}
export declare function runUserRepositoryContractTests(name: string, getFixtures: () => UserRepositoryContractFixtures): void;
//# sourceMappingURL=user-contract-tests.d.ts.map