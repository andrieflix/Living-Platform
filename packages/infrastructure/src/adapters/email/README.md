# Email Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `EmailAdapter` represents the capability to send transactional emails —
invitations, form notifications, password resets, export completion notices.
A future implementation may back this with Resend, AWS SES, or Postmark.

## Planned contracts

- **`EmailAdapter`** — send, batch send, with template support.
- **`EmailMessage`** — a single email (to, from, subject, body, attachments).
- **`EmailBatchResult`** — results of a batch send (successes, failures).

## Principles

1. **The adapter is provider-agnostic.** It uses generic email shapes, not
   provider-specific API calls.
2. **Emails are fire-and-forget from the use case's perspective.** The use
   case enqueues an email send; the adapter handles delivery asynchronously.
3. **Templates are referenced by key, not inlined.** The adapter resolves
   template keys to provider-specific templates, keeping email content out of
   application code.
