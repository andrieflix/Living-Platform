/**
 * Health checks module — liveness and readiness probe contracts.
 *
 * Contracts only. No implementation in this milestone.
 */
export type HealthState = "healthy" | "degraded" | "unhealthy";
export interface HealthCheck {
    readonly name: string;
    readonly critical: boolean;
    check(): Promise<HealthCheckResult>;
}
export interface HealthCheckResult {
    readonly state: HealthState;
    readonly message?: string;
    readonly latencyMs?: number;
}
export interface HealthStatus {
    readonly state: HealthState;
    readonly checks: readonly HealthCheckResult[];
    readonly timestamp: string;
}
export interface HealthRegistry {
    register(check: HealthCheck): void;
    evaluate(): Promise<HealthStatus>;
    readonly liveness: () => HealthStatus;
    readonly readiness: () => Promise<HealthStatus>;
}
//# sourceMappingURL=index.d.ts.map