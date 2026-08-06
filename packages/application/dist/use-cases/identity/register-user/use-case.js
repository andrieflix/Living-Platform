import { createUserDraft } from "@livingsites/domain";
import { mapAuthErrorToRegisterError } from "./errors";
import { validatePassword, normalizeEmail, validateDisplayName } from "./validator";
export async function registerUser(input, deps) {
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
    const session = regResult.value;
    const authSubjectId = session.identity.authSubjectId;
    const draft = createUserDraft({
        id: deps.idGenerator.generatePrefixed("user"),
        authSubjectId: authSubjectId,
        email: normalizedEmail,
        displayName: input.displayName.trim(),
        now: deps.clock.nowIso(),
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
    const user = createResult.value;
    if (user.version !== 1) {
        await compensate(deps, authSubjectId);
        return {
            ok: false,
            error: { code: "invalid_persistence_state", message: `Expected persisted version 1, got ${user.version}.` },
        };
    }
    const event = {
        type: "user.registered",
        occurredAt: deps.clock.nowIso(),
        organizationId: null,
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
    };
    try {
        await deps.eventPublisher.publish(event);
    }
    catch {
        return {
            ok: false,
            error: { code: "event_persistence_failure", message: "Failed to persist registration event." },
        };
    }
    return { ok: true, value: { user, session } };
}
async function compensate(deps, authSubjectId) {
    try {
        await deps.authenticationPort.revokeSession(authSubjectId);
    }
    catch {
        // Best-effort compensation. The failure is logged by the caller.
    }
}
//# sourceMappingURL=use-case.js.map