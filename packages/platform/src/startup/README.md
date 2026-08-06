# Startup

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The startup module defines the **application lifecycle**: the ordered sequence
of steps that bring the platform from cold to ready, and the reverse sequence
for graceful shutdown. It is the contract that the composition root implements
to boot and stop the application.

Startup is distinct from the composition root's wiring: the composition root
wires the object graph (providers → repositories → services); the startup
module defines the lifecycle phases around that wiring (init → ready → drain →
shutdown).

## Planned contracts

- **`StartupPhase`** — enum of lifecycle phases.
- **`StartupHook`** — a function registered to run at a specific phase
  (e.g. open database connections, warm caches, start background workers).
- **`ShutdownHook`** — a function registered to run during graceful shutdown
  (e.g. close connections, drain queues, flush telemetry).
- **`RuntimeLifecycle`** — the orchestrator that runs startup hooks in order,
  signals readiness, and runs shutdown hooks in reverse order.
- **`ReadinessProbe`** — a function that reports whether the application is
  ready to serve traffic.

## Principles

1. **Startup is ordered.** Hooks run in registration order within a phase;
   phases run in a fixed sequence. No hook runs before its dependencies are
   ready.
2. **Shutdown is the reverse of startup.** Hooks run in reverse registration
   order. Resources acquired last are released first.
3. **Shutdown is graceful.** The runtime drains in-flight requests before
   shutting down, with a configurable timeout. After the timeout, it forces
   shutdown.
4. **Readiness is explicit.** The runtime exposes a readiness probe that
   external orchestrators (load balancers, container platforms) can poll.
