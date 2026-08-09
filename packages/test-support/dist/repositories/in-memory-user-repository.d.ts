/**
 * In-memory User repository for tests.
 *
 * Implements UserReader and UserCreator using an in-memory Map.
 * Create behavior matches production:
 * - accepts UserDraft (version 0)
 * - returns User at version 1
 * - enforces unique authSubjectId
 * - enforces unique email
 * - typed errors (DuplicateKeyError)
 */
import type { User, UserId, AuthSubjectId, UserDraft } from "@livingsites/domain";
import type { CreateResult, UserReader, UserCreator } from "@livingsites/application";
export declare class InMemoryUserRepository implements UserReader, UserCreator {
    private store;
    private authSubjectIndex;
    private emailIndex;
    findById(id: UserId): Promise<User | null>;
    findByAuthSubjectId(authSubjectId: AuthSubjectId): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(draft: UserDraft): Promise<CreateResult<User>>;
    private toDomain;
    clear(): void;
}
//# sourceMappingURL=in-memory-user-repository.d.ts.map