import type { User, UserId, AuthSubjectId } from "@livingsites/domain";
import type { CreateResult } from "../contracts";
export interface UserReader {
    findById(id: UserId): Promise<User | null>;
    findByAuthSubjectId(authSubjectId: AuthSubjectId): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
}
export interface UserCreator {
    create(draft: import("@livingsites/domain").UserDraft): Promise<CreateResult<User>>;
}
//# sourceMappingURL=user.d.ts.map