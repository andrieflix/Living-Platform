/**
 * Forms bounded context — structured data capture from website visitors.
 *
 * Invariant: every Form belongs to exactly one Website. Submissions belong to
 * a Form. Submissions are append-only from the public web; mutations are only
 * status transitions (new → read → archived) and deletion by site staff.
 */
import type { FormId, FieldId, SubmissionId, WebsiteId, PageId, SectionId, MachineKey, ISODateString, AuditTrail, LifecycleStatus, AggregateVersion } from "../shared";
/** A form definition within a website. */
export interface Form {
    readonly id: FormId;
    readonly websiteId: WebsiteId;
    readonly key: MachineKey;
    name: string;
    description?: string;
    /** Ordered field definitions. */
    fields: readonly FormField[];
    /** Where submissions are forwarded. */
    notifications: FormNotifications;
    /** Anti-spam configuration. */
    spamProtection: FormSpamProtection;
    status: LifecycleStatus;
    /** Optimistic concurrency version. Monotonically incremented on each save. */
    version: AggregateVersion;
    readonly audit: AuditTrail;
}
/** A single field definition on a form. */
export interface FormField {
    readonly id: FieldId;
    readonly formId: FormId;
    readonly key: MachineKey;
    label: string;
    /** Placeholder/help text shown in the UI. */
    helpText?: string;
    type: FormFieldTypeValue;
    /** Whether the field must be filled to submit. */
    required: boolean;
    /** For select/radio/checkbox: the allowed options. */
    options?: readonly FormFieldOption[];
    /** Client-side validation constraints. */
    validation?: FormFieldValidation;
    /** Default value for prefill. */
    defaultValue?: string | number | boolean;
    sortOrder: number;
}
export interface FormFieldOption {
    label: string;
    value: string;
}
export interface FormFieldValidation {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
}
/** Notification routing for form submissions. */
export interface FormNotifications {
    /** Email addresses to notify on new submission. */
    emails: readonly string[];
    /** Optional webhook URL to POST each submission to. */
    webhookUrl?: string;
}
/** Anti-spam settings. */
export interface FormSpamProtection {
    honeypot: boolean;
    /** Provider key, e.g. "recaptcha", "turnstile", "none". */
    captchaProvider: "none" | "recaptcha" | "turnstile";
    /** Rate limit: max submissions per IP per hour. */
    rateLimitPerHour: number;
}
/**
 * A single visitor submission of a form.
 *
 * The `values` payload is immutable after creation. The `status` field is
 * mutable (state machine: new → read → replied → archived / spam). Because
 * status transitions are real mutations that can conflict (two staff members
 * updating the same submission), Submission carries an `AggregateVersion` for
 * optimistic concurrency on status updates.
 */
export interface Submission {
    readonly id: SubmissionId;
    readonly formId: FormId;
    readonly websiteId: WebsiteId;
    /** Where on the site the form was submitted from. */
    readonly source: SubmissionSource;
    /** Raw submitted values keyed by field key. Immutable after creation. */
    readonly values: Readonly<Record<string, string | number | boolean>>;
    /** Visitor metadata captured at submission. Immutable after creation. */
    readonly meta: SubmissionMeta;
    status: SubmissionStatus;
    /** Optimistic concurrency version. Monotonically incremented on each save. */
    version: AggregateVersion;
    readonly audit: AuditTrail;
}
export interface SubmissionSource {
    pageId?: PageId;
    sectionId?: SectionId;
    url?: string;
    referrer?: string;
}
export interface SubmissionMeta {
    ipHash?: string;
    userAgent?: string;
    locale?: string;
    submittedAt: ISODateString;
}
export declare enum FormFieldType {
    Text = "text",
    Email = "email",
    Phone = "phone",
    Number = "number",
    Textarea = "textarea",
    Select = "select",
    Radio = "radio",
    Checkbox = "checkbox",
    Date = "date",
    File = "file",
    Hidden = "hidden",
    Consent = "consent"
}
export declare enum SubmissionStatus {
    New = "new",
    Read = "read",
    Replied = "replied",
    Archived = "archived",
    Spam = "spam"
}
type FormFieldTypeValue = `${FormFieldType}`;
type SubmissionStatusValue = `${SubmissionStatus}`;
export type { SubmissionStatusValue };
//# sourceMappingURL=types.d.ts.map