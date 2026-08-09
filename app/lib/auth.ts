/**
 * Canonical auth accessor — server-only.
 *
 * Returns the raw Better Auth instance from the composition root.
 * All server-side code (route handler, pages, server actions) use this
 * single instance. No second auth instance is created anywhere.
 */
import "server-only";
import { getComposition } from "./composition";

export function getAuth() {
  return getComposition().authInstance;
}
