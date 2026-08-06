# Builder Use Cases

> **Status:** Architecture only. No implementation.

## Commands

- `StartBuilderSession` — Open a builder session for a page (optimistic editing context).
- `EndBuilderSession` — Close a session, releasing locks.
- `BatchUpdateSections` — Apply multiple section updates atomically within a session.
- `PreviewChanges` — Render a preview of the session's uncommitted state.
- `CommitChanges` — Persist pending changes from the session to the draft page.
- `DiscardChanges` — Discard pending changes and close the session.

## Queries

- `GetBuilderSession`, `ListActiveSessions`, `DetectConflicts`.

## Long-running Operations

None. Builder operations are interactive and synchronous within a session.

## Background Jobs

- `ExpireStaleSessions` — Close inactive sessions beyond a timeout.

## Events Produced

`BuilderSessionStarted`, `BuilderSessionEnded`, `BuilderChangesCommitted`,
`BuilderChangesDiscarded`, `BuilderConflictDetected`.

## Events Consumed

`PagePublished` → invalidate active sessions for that page. `PageArchived` →
force-close sessions for that page.

## External Dependencies

Database provider, rendering service (preview), realtime channel provider
(collaboration awareness).

## Authorization

Only the session owner can modify within their session. Website `editor`+ to
start a session.

## Future Extension Points

Real-time collaboration (CRDT/OT), undo/redo stack, AI-assisted layout.

See `docs/use-cases.md` §4 for the full catalog.
