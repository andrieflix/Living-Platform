/**
 * Email adapter contracts — provider-agnostic transactional email capability.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { Logger } from "@livingsites/platform";

/** A transactional email adapter: send, batch send. */
export interface EmailAdapter {
  send(message: EmailMessage): Promise<EmailSendResult>;
  sendBatch(messages: readonly EmailMessage[]): Promise<EmailBatchResult>;
  readonly logger: Logger;
}

export interface EmailMessage {
  readonly to: string;
  readonly from: string;
  readonly subject: string;
  readonly html?: string;
  readonly text?: string;
  readonly replyTo?: string;
  readonly templateKey?: string;
  readonly templateData?: Readonly<Record<string, string>>;
  readonly attachments?: readonly EmailAttachment[];
}

export interface EmailAttachment {
  readonly filename: string;
  readonly mimeType: string;
  readonly content: Uint8Array | ArrayBuffer;
}

export interface EmailSendResult {
  readonly messageId: string;
  readonly accepted: boolean;
}

export interface EmailBatchResult {
  readonly results: readonly EmailSendResult[];
  readonly sent: number;
  readonly failed: number;
}
