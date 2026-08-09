import { DRAFT_VERSION } from "./draft";
export function createUserDraft(input) {
    const audit = {
        createdAt: input.now,
        updatedAt: input.now,
    };
    return {
        id: input.id,
        authSubjectId: input.authSubjectId,
        email: input.email,
        displayName: input.displayName,
        status: "active",
        version: DRAFT_VERSION,
        audit,
    };
}
//# sourceMappingURL=factory.js.map