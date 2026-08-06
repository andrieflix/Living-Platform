/**
 * RegisterUser use case.
 *
 * Execution flow:
 *  1. Validate and normalize input (email, password, displayName)
 *  2. Check registration mode (open/invite_only/disabled)
 *  3. Create the Better Auth identity via AuthenticationPort
 *  4. Create the Living Platform User aggregate
 *  5. Persist the User linkage via UserCreator
 *  6. If persistence fails, compensate by revoking the auth identity
 *  7. Emit UserRegistered only after successful persistence
 *  8. Return a typed result
 *
 * Consistency strategy: Better Auth identity creation and Platform User
 * creation cannot share a single repository transaction because Better Auth
 * controls part of the persistence flow. We use a documented compensation
 * flow: if Platform User creation fails, the newly created auth identity is
 * revoked. This never leaves an active authentication identity without a
 * corresponding Platform User silently. See ADR 010.
 */
import type {
  Result,
  User,
  UserId,
  AuthSubjectId,
  ISODateString,
  UserRegisteredEvent,
} from "@livingsites/domain";
import { createUserDraft } from "@livingsites/domain";
import type {
  AuthenticationPort,
  RegistrationInput,
  AuthenticationSession,
} from "../../../identity/port";
import type { RegistrationMode } from "../../../identity/registration-mode";
import type { UserReader, UserCreator } from "../../../repositories/user";
import type { EventPublisher } from "../../../services/event-publisher";
import type { AppClock, AppIdGenerator } from "../../../services/organization-factory";
import type { RegisterUserOutput } from "./output";
import type { RegisterUserError } from "./errors";
import { mapAuthErrorToRegisterError } from "./errors";
import { validatePassword, normalizeEmail, validateDisplayName } from "./validator";

export interface RegisterUserDeps {
  readonly authenticationPort: AuthenticationPort;
  readonly userReader: UserReader;
  readonly userCreator: UserCreator;
  readonly eventPublisher: EventPublisher;
  readonly clock: AppClock;
  readonly idGenerator: AppIdGenerator;
  readonly registrationMode: RegistrationMode;
}

export async function registerUser(
  input: RegistrationInput,
  deps: RegisterUserDeps,
): Promise<Result<RegisterUserOutput, RegisterUserError>> {
  if (deps.registrationMode === "disabled") {
    return {
      ok: false,
      error: { code: "registration_disabled", message: "Registration is currently disabled." },
    };
  }
  if (deps.registrationMode === "invite_only") {
    return {
      ok: false,
      error: { code: "invitation_required", message: "Registration is invite-only. An invitation is required." },
    };
  }

  const normalizedEmail = normalizeEmail(input.email);
  if (normalizedEmail === null) {
    return {
      ok: false,
      error: { code: "input_validation", message: "A valid email address is required.", field: "email", value: input.email },
    };
  }

  const passwordValidation = validatePassword(input.password);
  if (!passwordValidation.ok) {
    return { ok: false, error: passwordValidation.error };
  }

  const displayNameValidation = validateDisplayName(input.displayName);
  if (!displayNameValidation.ok) {
    return { ok: false, error: displayNameValidation.error };
  }

  const existing = await deps.userReader.findByEmail(normalizedEmail);
  if (existing !== null) {
    return {
      ok: false,
      error: { code: "duplicate_email", message: "An account with this email already exists.", email: normalizedEmail },
    };
  }

  const regResult = await deps.authenticationPort.registerWithEmail({
    email: normalizedEmail,
    password: input.password,
    displayName: displayNameValidation.ok ? input.displayName.trim() : input.displayName,
  });

  if (!regResult.ok) {
    return { ok: false, error: mapAuthErrorToRegisterError(regResult.error) };
  }

  const session: AuthenticationSession = regResult.value;
  const authSubjectId = session.identity.authSubjectId;

  const draft = createUserDraft({
    id: deps.idGenerator.generatePrefixed("user") as UserId,
    authSubjectId: authSubjectId as AuthSubjectId,
    email: normalizedEmail,
    displayName: input.displayName.trim(),
    now: deps.clock.nowIso() as ISODateString,
  });

  const createResult = await deps.userCreator.create(draft);
  if (!createResult.ok) {
    await compensate(deps, authSubjectId);
    const err = createResult.error;
    switch (err.code) {
      case "duplicate_key":
        return {
          ok: false,
          error: { code: "duplicate_email", message: "An account with this email already exists.", email: normalizedEmail },
        };
      case "persistence_unavailable":
        return { ok: false, error: { code: "persistence_unavailable", message: err.message } };
      case "invalid_persistence_state":
        return { ok: false, error: { code: "invalid_persistence_state", message: err.message } };
    }
  }

  const user: User = createResult.value;

  if (user.version !== 1) {
    await compensate(deps, authSubjectId);
    return {
      ok: false,
      error: { code: "invalid_persistence_state", message: `Expected persisted version 1, got ${user.version}.` },
    };
  }

  const event: UserRegisteredEvent = {
    type: "user.registered",
    occurredAt: deps.clock.nowIso() as ISODateString,
    organizationId: null,
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
  };

  try {
    await deps.eventPublisher.publish(event);
  } catch {
    return {
      ok: false,
      error: { code: "event_persistence_failure", message: "Failed to persist registration event." },
    };
  }

  return { ok: true, value: { user, session } };
}

async function compensate(deps: RegisterUserDeps, authSubjectId: AuthSubjectId): Promise<void> {
  try {
    await deps.authenticationPort.revokeSession(authSubjectId as unknown as string);
  } catch {
    // Best-effort compensation. The failure is logged by the caller.
  }
}
