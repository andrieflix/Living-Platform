/**
 * Database adapter contracts — provider-agnostic relational database capability.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { Logger } from "@livingsites/platform";

/** A relational database adapter: query, transaction, migrate. */
export interface DatabaseAdapter {
  query<T>(sql: string, params?: readonly unknown[]): Promise<DatabaseQueryResult<T>>;
  transaction<T>(fn: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;
  migrate(): Promise<MigrationResult>;
  readonly logger: Logger;
}

/** A transaction scope. Queries within the transaction are atomic. */
export interface DatabaseTransaction {
  query<T>(sql: string, params?: readonly unknown[]): Promise<DatabaseQueryResult<T>>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

/** A typed query result. */
export interface DatabaseQueryResult<T> {
  readonly rows: readonly T[];
  readonly rowCount: number;
}

/** Result of running migrations. */
export interface MigrationResult {
  readonly applied: readonly string[];
  readonly skipped: readonly string[];
}

/** Runs schema migrations in order, tracking applied versions. */
export interface MigrationRunner {
  run(): Promise<MigrationResult>;
  listApplied(): Promise<readonly string[]>;
}
