/**
 * Theme bounded context — visual design tokens and section-type support.
 *
 * Split out of the website context to isolate the theming concern. A Theme
 * controls the rendered appearance of a website and declares which
 * SectionTypes it can render. System themes are platform-provided; org themes
 * are customizable.
 */
import type { ThemeId, OrganizationId, Slug, VersionString, AuditTrail, AggregateVersion } from "../shared";
/** Visual theme controlling the rendered appearance of a website. */
export interface Theme {
    readonly id: ThemeId;
    readonly organizationId: OrganizationId;
    readonly key: Slug;
    name: string;
    description?: string;
    /** Semver of the theme implementation. */
    releaseVersion: VersionString;
    /** Design tokens consumed by the rendering layer. */
    tokens: ThemeTokens;
    /** Registered section types this theme can render. */
    supportedSectionTypes: readonly string[];
    /** Whether this is a platform-provided theme vs org-custom. */
    isSystem: boolean;
    isActive: boolean;
    /** Optimistic concurrency version. Monotonically incremented on each save. */
    version: AggregateVersion;
    readonly audit: AuditTrail;
}
/** Serializable design-token block. Opaque to the domain; owned by rendering. */
export interface ThemeTokens {
    [tokenName: string]: string | number | boolean | readonly ThemeTokens[];
}
//# sourceMappingURL=types.d.ts.map