# Events Bounded Context

> **Status:** Reserved. Contracts only — no implementation. No event bus.

## Future Responsibilities

The Events context models **domain events** — discrete, named facts about
something that happened in the domain. Domain events are the mechanism by
which bounded contexts communicate without direct coupling: a context emits
an event; interested contexts (or infrastructure: webhooks, analytics,
notifications) react.

This context defines the event **vocabulary** and **contracts** only. It does
**not** define an event bus, dispatcher, or any runtime machinery. That is an
infrastructure concern for a future milestone.

## Design Principles

1. **Events are facts, not commands.** `PagePublished` describes that a page
   was published; it does not ask anyone to do anything.
2. **Events are immutable.** Once emitted, an event's payload does not change.
3. **Events are named in past tense.** `FormSubmitted`, not `SubmitForm`.
4. **Events carry just enough to act.** They include entity IDs and the
   changed values needed by typical subscribers; they are not full entity dumps.
5. **No event bus here.** This context defines what events exist and their
   shapes. How they are dispatched (in-process, message queue, realtime) is
   infrastructure.

## Planned Events

| Event | Emitted by | Payload highlights |
|---|---|---|
| `OrganizationCreated` | Organization context | `organizationId`, `slug`, `planId` |
| `WebsiteCreated` | Website context | `websiteId`, `organizationId`, `slug` |
| `WebsitePublished` | Website context | `websiteId`, `publishedVersion` |
| `PagePublished` | Page context | `pageId`, `websiteId`, `snapshotId`, `version` |
| `PageArchived` | Page context | `pageId`, `websiteId` |
| `MediaUploaded` | Media context | `mediaId`, `websiteId`, `mimeType`, `sizeBytes` |
| `FormSubmitted` | Forms context | `submissionId`, `formId`, `websiteId` |
| `FeatureEnabled` | Organization context | `organizationId`, `featureKey`, `value` |
| `PluginInstalled` | Plugin context | `organizationId`, `pluginId` |
| `ExportCompleted` | Export context | `jobId`, `websiteId`, `downloadUrl` |

## Boundaries

- Events are **owned by the context that emits them**. The Events context
  aggregates the vocabulary but each emitting context defines its event shape.
- Events **must not** carry behavior (methods, functions). They are plain data.
- Subscribers **must not** be coupled to emitters. A subscriber depends on the
  event contract, not on the emitting service.
