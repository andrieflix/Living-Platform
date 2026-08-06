# Form Repository Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `FormRepositoryAdapter` adapts the application-layer `FormRepository` and
`SubmissionRepository` interfaces to infrastructure providers. It adds
infrastructure lifecycle methods via `DatabaseBackedAdapter`.

`FormRepository` owns the Form aggregate root, including its FormField child
entities. FormFields have no public repository port — they are persisted
atomically with the Form through the `FormRepository`. The adapter may use
an internal table mapper for form fields, but that mapper is a private
implementation detail.

## Planned contracts

- **`FormRepositoryAdapter`** — composes `FormRepository` and
  `SubmissionRepository` as named sub-adapters with `DatabaseBackedAdapter`
  lifecycle methods.

## Principles

1. The adapter implements the application-layer contracts — use cases see no
   difference.
2. Form definitions and submissions are stored in the database. Submission
   payloads are stored as JSON blobs with indexed status fields for filtering.
3. Hard-deleting a submission (GDPR right-to-be-forgotten) removes the row
   entirely — no soft-delete for submissions flagged for erasure.
4. Internal table mappers for form fields are private to the adapter — they
   are not exposed as application-layer ports.
