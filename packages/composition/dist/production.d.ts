import type { Clock, IdGenerator, Logger } from "@livingsites/platform";
import type { OrganizationReader, OrganizationCreator, PlanReader, FeatureReader, UserReader, UserCreator, EventPublisher, OrganizationCreationPersistence, OutboxProcessor, AuthenticationPort, EmailVerificationPort, RegistrationMode } from "@livingsites/application";
import { createOrganization, registerUser } from "@livingsites/application";
import type { CreateOrganizationDeps, RegisterUserDeps } from "@livingsites/application";
export interface ProductionCompositionConfig {
    readonly connectionString?: string;
    readonly logLevel?: "trace" | "debug" | "info" | "warn" | "error" | "silent";
    readonly outboxMaxAttempts?: number;
    readonly outboxBaseBackoffMs?: number;
    readonly outboxMaxBackoffMs?: number;
    readonly betterAuthSecret: string;
    readonly betterAuthUrl: string;
    readonly trustedOrigins: readonly string[];
    readonly registrationMode?: string;
    readonly emailVerificationEnabled?: boolean;
    readonly emailAdapter?: EmailVerificationPort;
}
export interface ProductionComposition {
    readonly clock: Clock;
    readonly idGenerator: IdGenerator;
    readonly logger: Logger;
    readonly eventPublisher: EventPublisher;
    readonly organizationRepository: OrganizationReader & OrganizationCreator;
    readonly planReader: PlanReader;
    readonly featureReader: FeatureReader;
    readonly userReader: UserReader;
    readonly userCreator: UserCreator;
    readonly authenticationPort: AuthenticationPort;
    readonly emailVerificationPort: EmailVerificationPort | null;
    readonly organizationCreationPersistence: OrganizationCreationPersistence;
    readonly outboxProcessor: OutboxProcessor;
    readonly createOrganization: typeof createOrganization;
    readonly createOrganizationDeps: CreateOrganizationDeps;
    readonly registerUser: typeof registerUser;
    readonly registerUserDeps: RegisterUserDeps;
    readonly registrationMode: RegistrationMode;
    readonly healthCheck: () => Promise<{
        healthy: boolean;
        details: Record<string, boolean>;
    }>;
    readonly close: () => Promise<void>;
}
export declare function composeProduction(config: ProductionCompositionConfig): ProductionComposition;
//# sourceMappingURL=production.d.ts.map