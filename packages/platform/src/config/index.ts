/**
 * Config module — typed, read-only application configuration.
 *
 * Contracts only. No implementation in this milestone.
 */

/** A loader that produces a frozen Config from a source. */
export interface ConfigSource {
  load(): Promise<Config>;
}

/** Frozen, typed application configuration. */
export interface Config {
  readonly http: HttpConfig;
  readonly storage: StorageConfig;
  readonly export: ExportConfig;
  readonly media: MediaConfig;
  readonly analytics: AnalyticsConfig;
  readonly forms: FormsConfig;
}

export interface HttpConfig {
  readonly port: number;
  readonly bodyLimitBytes: number;
  readonly requestTimeoutMs: number;
}

export interface StorageConfig {
  readonly maxUploadBytes: number;
  readonly allowedMimeTypes: readonly string[];
  readonly presignedUrlTtlMs: number;
}

export interface ExportConfig {
  readonly maxConcurrentJobs: number;
  readonly jobTimeoutMs: number;
  readonly downloadUrlTtlMs: number;
}

export interface MediaConfig {
  readonly thumbnailWidths: readonly number[];
  readonly maxAltTextLength: number;
}

export interface AnalyticsConfig {
  readonly defaultProvider: string;
  readonly eventBufferSize: number;
}

export interface FormsConfig {
  readonly maxFieldsPerForm: number;
  readonly maxSubmissionSizeBytes: number;
  readonly spamScoreThreshold: number;
}
