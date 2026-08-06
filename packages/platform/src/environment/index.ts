/**
 * Environment module — secure access to environment variables and secrets.
 *
 * Contracts only. No implementation in this milestone.
 */

/** Reads raw environment variables from the host. */
export interface EnvironmentSource {
  get(key: string): string | undefined;
  require(key: string): string;
  has(key: string): boolean;
}

/** Opaque reference to a secret. Never holds the raw value. */
export interface SecretRef {
  readonly key: string;
}

/** Validated, typed view of the environment. */
export interface Environment {
  readonly nodeEnv: "development" | "test" | "staging" | "production";
  readonly logLevel: LogLevel;
  readonly databaseUrl: SecretRef;
  readonly storageBucket: string;
  readonly analyticsApiKey?: SecretRef;
  readonly emailApiKey?: SecretRef;
}

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "silent";
