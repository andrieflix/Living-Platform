# Forms Use Cases

> **Status:** Architecture only. No implementation.

## Commands

- `CreateForm` — Create a form with a field specification.
- `UpdateForm` — Change form fields, settings, or notification config.
- `DeleteForm` — Soft-delete a form.
- `SubmitForm` — Accept a form submission from a visitor (public).
- `UpdateSubmissionStatus` — Change submission status (read, flagged, archived).
- `DeleteSubmission` — Hard-delete a submission (GDPR).

## Queries

- `GetForm`, `ListForms`, `GetSubmission`, `ListSubmissions`,
  `ExportSubmissions` (CSV/JSON).

## Long-running Operations

None. Form submission is synchronous (spam check, persist, notify).

## Background Jobs

- `SendFormNotification` — Email the form owner about a new submission.
- `PurgeOldSubmissions` — Delete submissions past retention.

## Events Produced

`FormCreated`, `FormUpdated`, `FormDeleted`, `FormSubmitted`,
`SubmissionStatusUpdated`.

## Events Consumed

`WebsiteArchived` → stop accepting submissions. `PagePublished` → ensure
form sections reference active forms.

## External Dependencies

Database provider, email provider, spam screening service (Akismet,
reCAPTCHA, or built-in).

## Authorization

Website `editor`+: create, update forms. Website `admin`+: delete forms and
submissions. Public: submit forms (no auth).

## Future Extension Points

Conditional fields, multi-step forms, webhooks, file upload fields, CRM
integration.

See `docs/use-cases.md` §8 for the full catalog.
