# @livingsites/composition — Composition Root

> **Status:** Architecture only. No implementation, no classes, no DI
> container, no runtime behavior in this milestone.

## What this package is

The composition root is the **single place** in the Living Sites platform
where concrete implementations of repository and service contracts are
instantiated and wired together. Nothing outside this package may construct
repositories, services, or infrastructure providers directly.

## Package structure

```
packages/composition/
├── README.md                          ← you are here
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                       ← export placeholder (re-exports contracts)
    ├── registries/
    │   ├── services.md                ← future service registration plan
    │   ├── repositories.md            ← future repository registration plan
    │   └── providers.md               ← future provider registration plan
    ├── factories/
    │   └── README.md                  ← future factory strategy
    └── documentation/
        └── dependency-resolution.md   ← how the object graph is assembled
```

## Dependency direction

```
UI / API
    →  @livingsites/application     (service contracts)
    →  @livingsites/domain          (entities, value objects)

@livingsites/composition
    →  @livingsites/application     (contracts to wire)
    →  @livingsites/domain          (entity types)
    →  @livingsites/infrastructure  (future: concrete implementations)
```

The composition root is the **only** package that depends on
`@livingsites/infrastructure`. The UI never imports from composition or
infrastructure.

## What this package will contain (future)

When implementations are added in a future milestone:

1. **A boot function** that reads configuration, creates providers, creates
   repositories, creates services, creates factories, and returns a wired
   service container.
2. **Concrete wiring** — the `new` calls that bind each contract to its
   implementation. No DI framework; manual wiring is sufficient and explicit.
3. **Factory implementations** that create complex domain objects with
   defaults, validation, and multi-step assembly.
4. **Provider selection** — the logic that decides which database, storage,
   analytics, email, and queue providers to use based on configuration.

## What this package will NOT contain

- **Business logic.** That lives in service implementations (in a future
  `@livingsites/infrastructure` or separate implementation package).
- **Domain entities.** Those live in `@livingsites/domain`.
- **Contract definitions.** Those live in `@livingsites/application`.
- **UI code.** The UI receives already-wired services.
- **A DI framework.** Wiring is manual and explicit. The object graph is
  simple enough that a framework adds indirection without value.

## Why a separate package

- **Physical enforcement of the dependency rule.** If composition is a
  separate package, a lint rule can mechanically enforce that no file outside
  `packages/composition/` imports from `@livingsites/infrastructure` or
  references a concrete implementation class.
- **Single point of change.** Swapping a provider (e.g. Supabase → another
  database) changes one package — this one — not the UI or services.
- **Clear audit trail.** Every concrete implementation used in the platform
  is referenced from one package, making it easy to audit what is wired where.
