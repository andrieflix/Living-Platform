# Rendering Bounded Context

> **Status:** Reserved. Contracts only — no implementation.

## Future Responsibilities

The Rendering context models the **public-rendering pipeline**: turning a
published page snapshot into HTML (or another output format) for a given
locale and theme. It is consumed by the public site, the preview surface, and
the export pipeline.

It is distinct from the `Builder` context (authoring) and from the
`RenderingService` application contract (orchestration). This context owns the
**rendering vocabulary**: rendered pages, render contexts, output formats, and
render-time metadata.

## Planned Entities

- **RenderedPage** — a single rendered output: path, HTML, status code,
  headers, JSON-LD blocks.
- **RenderContext** — the inputs to a render: website, page snapshot, locale,
  theme tokens, resolved SEO, preview flag.
- **OutputFormat** — the target format (HTML, static HTML for export, PDF in
  the future).

## Boundaries

- Rendering reads from snapshots and resolved SEO — never from live draft
  state (except in preview mode, which is explicitly flagged).
- Rendering never mutates domain entities.
- Rendering is theme-aware: it consumes `Theme.tokens` and
  `Theme.supportedSectionTypes` but does not own them.
