import { describe, it, expect } from "vitest";
import { validatePassword, normalizeEmail, validateDisplayName, PASSWORD_MAX_LENGTH } from "@livingsites/application";

describe("Password policy", () => {
  it("accepts a valid password of minimum length", () => {
    const result = validatePassword("a-very-secure-password-123");
    expect(result.ok).toBe(true);
  });

  it("rejects password shorter than 12 characters", () => {
    const result = validatePassword("short123!");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("weak_password");
      expect(result.error.message).toContain("12");
    }
  });

  it("rejects empty password", () => {
    const result = validatePassword("");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("weak_password");
    }
  });

  it("rejects whitespace-only password", () => {
    const result = validatePassword("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("weak_password");
    }
  });

  it("rejects overly long password", () => {
    const result = validatePassword("a".repeat(PASSWORD_MAX_LENGTH + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("weak_password");
    }
  });

  it("rejects password with leading/trailing whitespace", () => {
    const result = validatePassword("  valid-password-here-12  ");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("weak_password");
    }
  });

  it("never includes the password in the error message", () => {
    const password = "my-secret-password-123";
    const result = validatePassword(password.slice(0, 8));
    if (!result.ok) {
      expect(result.error.message).not.toContain(password);
    }
  });
});

describe("Email normalization", () => {
  it("normalizes to lowercase", () => {
    expect(normalizeEmail("UPPER@TEST.COM")).toBe("upper@test.com");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeEmail("  test@test.com  ")).toBe("test@test.com");
  });

  it("rejects invalid email", () => {
    expect(normalizeEmail("not-an-email")).toBeNull();
    expect(normalizeEmail("missing@domain")).toBeNull();
    expect(normalizeEmail("@nodomain.com")).toBeNull();
  });

  it("rejects non-string input", () => {
    expect(normalizeEmail(null as unknown as string)).toBeNull();
  });
});

describe("Display name validation", () => {
  it("accepts a valid display name", () => {
    const result = validateDisplayName("Alice");
    expect(result.ok).toBe(true);
  });

  it("rejects empty display name", () => {
    const result = validateDisplayName("");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe("displayName");
    }
  });

  it("rejects whitespace-only display name", () => {
    const result = validateDisplayName("   ");
    expect(result.ok).toBe(false);
  });

  it("rejects overly long display name", () => {
    const result = validateDisplayName("a".repeat(201));
    expect(result.ok).toBe(false);
  });
});
