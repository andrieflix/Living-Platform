/**
 * RegisterUser use case.
 *
 * Execution flow:
 *  1. Validate and normalize input (email, password, displayName)
 *  2. Check registration mode (open/invite_only/disabled)
 *  3. Create the Better Auth identity via AuthenticationPort
 *  4. Create the Living Platform User aggregate
 *  5. Persist the User linkage via UserCreator
 *  6. If persistence fails, compensate by revoking the auth identity
 *  7. Emit UserRegistered only after successful persistence
 *  8. Return a typed result
 *
 * Consistency strategy: Better Auth identity creation and Platform User
 * creation cannot share a single repository transaction because Better Auth
 * controls part of the persistence flow. We use a documented compensation
 * flow: if Platform User creation fails, the newly created auth identity is
 * revoked. This never leaves an active authentication identity without a
 * corresponding Platform User silently. See ADR 010.
 */
import type { Result } from "@livingsites/domain";
import type { AuthenticationPort, RegistrationInput } from "../../../identity/port";
import type { RegistrationMode } from "../../../identity/registration-mode";
import type { UserReader, UserCreator } from "../../../repositories/user";
import type { EventPublisher } from "../../../services/event-publisher";
import type { AppClock, AppIdGenerator } from "../../../services/organization-factory";
import type { RegisterUserOutput } from "./output";
import type { RegisterUserError } from "./errors";
export interface RegisterUserDeps {
    readonly authenticationPort: AuthenticationPort;
    readonly userReader: UserReader;
    readonly userCreator: UserCreator;
    readonly eventPublisher: EventPublisher;
    readonly clock: AppClock;
    readonly idGenerator: AppIdGenerator;
    readonly registrationMode: RegistrationMode;
}
export declare function registerUser(input: RegistrationInput, deps: RegisterUserDeps): Promise<Result<RegisterUserOutput, RegisterUserError>>;
//# sourceMappingURL=use-case.d.ts.map