/**
 * SystemClock — production Clock implementation using the host clock.
 */
import type { Clock } from "../index";

export class SystemClock implements Clock {
  nowIso(): string {
    return new Date().toISOString();
  }
  nowMs(): number {
    return Date.now();
  }
}
