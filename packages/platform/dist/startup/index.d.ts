/**
 * Startup module — application lifecycle: ordered startup and graceful shutdown.
 *
 * Contracts only. No implementation in this milestone.
 */
export declare enum StartupPhase {
    Init = "init",
    Providers = "providers",
    Repositories = "repositories",
    Services = "services",
    Ready = "ready"
}
export interface StartupHook {
    readonly phase: StartupPhase;
    readonly name: string;
    run(): Promise<void>;
}
export interface ShutdownHook {
    readonly name: string;
    run(): Promise<void>;
}
export type ReadinessProbe = () => Promise<ReadinessStatus>;
export interface ReadinessStatus {
    readonly ready: boolean;
    readonly checks: readonly ReadinessCheck[];
}
export interface ReadinessCheck {
    readonly name: string;
    readonly healthy: boolean;
    readonly message?: string;
}
export interface RuntimeLifecycle {
    start(): Promise<void>;
    stop(): Promise<void>;
    onReady(): Promise<void>;
    registerStartupHook(hook: StartupHook): void;
    registerShutdownHook(hook: ShutdownHook): void;
    readonly readiness: ReadinessProbe;
}
//# sourceMappingURL=index.d.ts.map