/**
 * FakeClock — deterministic Clock for tests.
 */
import type { Clock } from "../index";

export class FakeClock implements Clock {
  private currentMs: number;

  constructor(initialMs: number = 0) {
    this.currentMs = initialMs;
  }

  nowIso(): string {
    return new Date(this.currentMs).toISOString();
  }

  nowMs(): number {
    return this.currentMs;
  }

  advance(deltaMs: number): void {
    this.currentMs += deltaMs;
  }

  set(ms: number): void {
    this.currentMs = ms;
  }
}
