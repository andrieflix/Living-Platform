import type { Form, FormField, Submission, SubmissionStatus, FormId, SubmissionId, WebsiteId, Result, DomainError } from "@livingsites/domain";
export interface FormService {
    createForm(input: {
        websiteId: WebsiteId;
        key: string;
        name: string;
        fields: Array<Omit<FormField, "id" | "formId">>;
    }): Promise<Result<Form, DomainError>>;
    updateFields(formId: FormId, fields: Array<Omit<FormField, "id" | "formId">>): Promise<Result<Form, DomainError>>;
    configureNotifications(formId: FormId, notifications: Form["notifications"]): Promise<Result<Form, DomainError>>;
    submit(input: {
        formKey: string;
        websiteId: WebsiteId;
        values: Record<string, string | number | boolean>;
        source: {
            pageId?: string;
            sectionId?: string;
            url?: string;
            referrer?: string;
        };
        meta: {
            userAgent?: string;
            locale?: string;
            ipHash?: string;
        };
    }): Promise<Result<Submission, DomainError>>;
    updateSubmissionStatus(id: SubmissionId, status: SubmissionStatus): Promise<Result<Submission, DomainError>>;
    deleteSubmission(id: SubmissionId): Promise<Result<void, DomainError>>;
}
//# sourceMappingURL=forms.d.ts.map