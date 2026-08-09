import type { User } from "@livingsites/domain";
import type { AuthenticationSession } from "../../../identity/port";
export interface RegisterUserOutput {
    readonly user: User;
    readonly session: AuthenticationSession;
}
//# sourceMappingURL=output.d.ts.map