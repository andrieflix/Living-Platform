/**
 * Startup module — application lifecycle: ordered startup and graceful shutdown.
 *
 * Contracts only. No implementation in this milestone.
 */
export var StartupPhase;
(function (StartupPhase) {
    StartupPhase["Init"] = "init";
    StartupPhase["Providers"] = "providers";
    StartupPhase["Repositories"] = "repositories";
    StartupPhase["Services"] = "services";
    StartupPhase["Ready"] = "ready";
})(StartupPhase || (StartupPhase = {}));
//# sourceMappingURL=index.js.map