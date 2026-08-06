# Health Checks

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The health module provides a **health-check contract** that the runtime uses
to report whether the application and its dependencies are healthy. It
distinguishes between **liveness** (the application process is alive) and
**readiness** (the application is ready to serve traffic).

## Planned contracts

- **`HealthCheck`** — a named check function that probes a dependency
  (database, storage, external API) and returns a status.
- **`HealthStatus`** — the aggregate result: healthy, degraded, or
  unhealthy, with per-check breakdown.
- **`HealthRegistry`** — registers health checks and evaluates them on
  demand.
- **`LivenessProbe`** — always returns healthy if the process is running;
  used by orchestrators to decide whether to restart the container.
- **`ReadinessProbe`** — evaluates registered checks; used by load balancers
  to decide whether to route traffic.

## Principles

1. **Liveness is trivial; readiness is meaningful.** Liveness proves the
   process exists. Readiness proves the process can serve requests (database
   reachable, storage reachable, etc.).
2. **Health checks have timeouts.** A check that takes too long is a failed
   check, not a hanging one.
3. **Health checks are not expensive.** They run frequently (every few
   seconds) and must not load the system.
4. **Degraded is a first-class state.** If a non-critical dependency (e.g.
   analytics) is down but the core is up, the status is `degraded`, not
   `unhealthy` — traffic still routes.
