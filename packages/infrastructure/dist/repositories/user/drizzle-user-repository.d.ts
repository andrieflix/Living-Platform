import type { Logger } from "@livingsites/platform";
import type { User, UserId, AuthSubjectId, UserDraft } from "@livingsites/domain";
import type { CreateResult } from "@livingsites/application";
import type { UserReader, UserCreator } from "@livingsites/application";
import type { DrizzleDB } from "../../db/drizzle-instance";
export interface DrizzleUserRepositoryConfig {
    readonly db: DrizzleDB;
    readonly logger: Logger;
}
export declare class DrizzleUserRepository implements UserReader, UserCreator {
    private readonly db;
    private readonly logger;
    constructor(config: DrizzleUserRepositoryConfig);
    findById(id: UserId): Promise<User | null>;
    findByAuthSubjectId(authSubjectId: AuthSubjectId): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(draft: UserDraft): Promise<CreateResult<User>>;
    private mapCreateError;
}
//# sourceMappingURL=drizzle-user-repository.d.ts.map