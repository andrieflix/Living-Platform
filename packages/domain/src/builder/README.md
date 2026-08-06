# Builder Bounded Context

> **Status:** Reserved. Contracts only — no implementation.

## Future Responsibilities

The Builder context models the **authoring surface** concepts: the canvas a
page builder works on, section placement, drag-and-drop positioning, and the
aggregate payloads needed to render the editing UI efficiently.

It is distinct from the `Section` context (which models the entities) and from
the `BuilderService` application contract (which orchestrates mutations). This
context owns the **domain vocabulary** the builder operates in — placement
intents, insertion anchors, canvas snapshots, and validation intents.

## Planned Entities

- **Canvas** — the aggregate view of a page under edit (page + sections +
  available section types + recent media).
- **PlacementIntent** — a declarative description of where a new section should
  go (after a given section, at the top, at the bottom, replacing another).
- **BuilderSession** — tracks an in-progress editing session for optimistic-UI
  coordination and conflict detection.

## Boundaries

- The Builder context **does not** own persistence. It defines the shape of
  what the application layer's `BuilderService` loads and mutates.
- The Builder context **does not** render. Rendering is the `rendering` context.
- The Builder context may reference `Page`, `Section`, `SectionType`, and
  `Media` entities but never mutates them directly.
