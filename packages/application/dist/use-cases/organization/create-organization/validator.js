const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MIN_LENGTH = 2;
const SLUG_MAX_LENGTH = 63;
const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateCreateOrganizationInput(input) {
    const name = input.name.trim();
    if (name.length < NAME_MIN_LENGTH) {
        return {
            ok: false,
            error: { code: "input_validation", message: "Name is required.", field: "name", value: input.name },
        };
    }
    if (name.length > NAME_MAX_LENGTH) {
        return {
            ok: false,
            error: { code: "input_validation", message: `Name must not exceed ${NAME_MAX_LENGTH} characters.`, field: "name", value: input.name },
        };
    }
    const slug = input.slug.trim().toLowerCase();
    if (slug.length < SLUG_MIN_LENGTH) {
        return {
            ok: false,
            error: { code: "input_validation", message: `Slug must be at least ${SLUG_MIN_LENGTH} characters.`, field: "slug", value: input.slug },
        };
    }
    if (slug.length > SLUG_MAX_LENGTH) {
        return {
            ok: false,
            error: { code: "input_validation", message: `Slug must not exceed ${SLUG_MAX_LENGTH} characters.`, field: "slug", value: input.slug },
        };
    }
    if (!SLUG_PATTERN.test(slug)) {
        return {
            ok: false,
            error: { code: "input_validation", message: "Slug must be lowercase alphanumeric with single dashes.", field: "slug", value: input.slug },
        };
    }
    const billingEmail = input.billingEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(billingEmail)) {
        return {
            ok: false,
            error: { code: "input_validation", message: "Billing email is not a valid email address.", field: "billingEmail", value: input.billingEmail },
        };
    }
    return { ok: true, normalized: { name, slug, billingEmail } };
}
//# sourceMappingURL=validator.js.map