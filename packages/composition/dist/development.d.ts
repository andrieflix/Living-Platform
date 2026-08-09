/**
 * Composition root — development wiring.
 *
 * Uses deterministic/in-memory adapters for local development. This is
 * explicitly named development and is NOT for production use.
 */
import { FakeClock, DeterministicIdGenerator } from "@livingsites/platform";
import type { Logger } from "@livingsites/platform";
import { InMemoryOrganizationRepository, InMemoryPlanRepository, InMemoryUserRepository, FakeAuthenticationAdapter } from "@livingsites/test-support";
import type { EventPublisher, EmailVerificationPort } from "@livingsites/application";
import { createOrganization, registerUser } from "@livingsites/application";
import type { CreateOrganizationDeps, RegisterUserDeps } from "@livingsites/application";
export interface DevelopmentCompositionConfig {
    readonly initialClockMs?: number;
    readonly eventPublisher?: EventPublisher;
    readonly registrationMode?: "open" | "invite_only" | "disabled";
    readonly emailVerificationPort?: EmailVerificationPort;
}
export interface DevelopmentComposition {
    readonly clock: FakeClock;
    readonly idGenerator: DeterministicIdGenerator;
    readonly logger: Logger;
    readonly eventPublisher: EventPublisher;
    readonly organizationRepository: InMemoryOrganizationRepository;
    readonly planRepository: InMemoryPlanRepository;
    readonly userRepository: InMemoryUserRepository;
    readonly authenticationPort: FakeAuthenticationAdapter;
    readonly emailVerificationPort: EmailVerificationPort;
    readonly createOrganization: typeof createOrganization;
    readonly createOrganizationDeps: CreateOrganizationDeps;
    readonly registerUser: typeof registerUser;
    readonly registerUserDeps: RegisterUserDeps;
}
export declare function composeDevelopment(config?: DevelopmentCompositionConfig): DevelopmentComposition;
//# sourceMappingURL=development.d.ts.map