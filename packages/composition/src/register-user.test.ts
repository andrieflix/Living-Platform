import { describe, it, expect, beforeEach } from "vitest";
import { registerUser } from "@livingsites/application";
import type { RegisterUserDeps } from "@livingsites/application";
import {
  InMemoryUserRepository,
  FakeAuthenticationAdapter,
  InMemoryEventPublisher,
  FakeClock,
  DeterministicIdGenerator,
} from "@livingsites/test-support";

describe("registerUser use case", () => {
  let auth: FakeAuthenticationAdapter;
  let userRepo: InMemoryUserRepository;
  let eventPublisher: InMemoryEventPublisher;
  let deps: RegisterUserDeps;

  beforeEach(() => {
    auth = new FakeAuthenticationAdapter();
    userRepo = new InMemoryUserRepository();
    eventPublisher = new InMemoryEventPublisher();
    const clock = new FakeClock(0);
    const idGenerator = new DeterministicIdGenerator();

    deps = {
      authenticationPort: auth,
      userReader: userRepo,
      userCreator: userRepo,
      eventPublisher,
      clock,
      idGenerator,
      registrationMode: "open",
    };
  });

  it("valid registration creates identity and Platform User", async () => {
    const result = await registerUser({
      email: "alice@test.com",
      password: "very-secure-password-123",
      displayName: "Alice",
    }, deps);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.user.email).toBe("alice@test.com");
      expect(result.value.user.displayName).toBe("Alice");
      expect(result.value.user.version).toBe(1);
      expect(result.value.session.sessionToken).toBeTruthy();
    }
  });

  it("success emits exactly one UserRegistered event", async () => {
    const result = await registerUser({
      email: "bob@test.com",
      password: "very-secure-password-123",
      displayName: "Bob",
    }, deps);

    expect(result.ok).toBe(true);
    expect(eventPublisher.published.length).toBe(1);
    expect(eventPublisher.published[0]?.type).toBe("user.registered");
  });

  it("duplicate email is typed", async () => {
    await registerUser({
      email: "dup@test.com",
      password: "very-secure-password-123",
      displayName: "First",
    }, deps);

    const result = await registerUser({
      email: "dup@test.com",
      password: "very-secure-password-123",
      displayName: "Second",
    }, deps);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("duplicate_email");
    }
  });

  it("Platform User failure triggers compensation", async () => {
    auth.failRegistration = false;

    await registerUser({
      email: "first@test.com",
      password: "very-secure-password-123",
      displayName: "First",
    }, deps);

    const result = await registerUser({
      email: "first@test.com",
      password: "very-secure-password-123",
      displayName: "Second",
    }, deps);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("duplicate_email");
    }
  });

  it("failed registration emits no UserRegistered event", async () => {
    auth.failRegistration = true;

    const result = await registerUser({
      email: "fail@test.com",
      password: "very-secure-password-123",
      displayName: "Fail",
    }, deps);

    expect(result.ok).toBe(false);
    expect(eventPublisher.published.length).toBe(0);
  });

  it("registration mode open allows development registration", async () => {
    deps = { ...deps, registrationMode: "open" };
    const result = await registerUser({
      email: "open@test.com",
      password: "very-secure-password-123",
      displayName: "Open",
    }, deps);

    expect(result.ok).toBe(true);
  });

  it("disabled blocks registration", async () => {
    deps = { ...deps, registrationMode: "disabled" };
    const result = await registerUser({
      email: "disabled@test.com",
      password: "very-secure-password-123",
      displayName: "Disabled",
    }, deps);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("registration_disabled");
    }
  });

  it("invite_only blocks without invitation", async () => {
    deps = { ...deps, registrationMode: "invite_only" };
    const result = await registerUser({
      email: "invite@test.com",
      password: "very-secure-password-123",
      displayName: "Invite",
    }, deps);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("invitation_required");
    }
  });

  it("invalid email is rejected", async () => {
    const result = await registerUser({
      email: "not-an-email",
      password: "very-secure-password-123",
      displayName: "Invalid",
    }, deps);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("input_validation");
    }
  });

  it("weak password is rejected", async () => {
    const result = await registerUser({
      email: "weak@test.com",
      password: "short",
      displayName: "Weak",
    }, deps);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("weak_password");
    }
  });

  it("empty display name is rejected", async () => {
    const result = await registerUser({
      email: "noname@test.com",
      password: "very-secure-password-123",
      displayName: "",
    }, deps);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("input_validation");
    }
  });

  it("event does not contain password or session token", async () => {
    const result = await registerUser({
      email: "safe@test.com",
      password: "very-secure-password-123",
      displayName: "Safe",
    }, deps);

    expect(result.ok).toBe(true);
    const event = eventPublisher.published[0];
    expect(JSON.stringify(event)).not.toContain("password");
    expect(JSON.stringify(event)).not.toContain("very-secure-password-123");
  });
});
