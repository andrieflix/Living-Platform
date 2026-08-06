/**
 * Section bounded context — the atomic content building block of a Page.
 *
 * A Section is an *instance* of a registered SectionType. Sections are never
 * free-form: they must reference a SectionType that has been registered with
 * the platform (or a plugin). The SectionType defines the props schema; the
 * Section holds the concrete values.
 */
import type { SectionId, SectionTypeId, WebsiteId, PageId, MachineKey, VersionString, AuditTrail, LifecycleStatus, LocaleCode, AggregateVersion } from "../shared";
/** A single section instance placed on a page. */
export interface Section {
    readonly id: SectionId;
    readonly websiteId: WebsiteId;
    readonly pageId: PageId;
    readonly sectionTypeId: SectionTypeId;
    /** Concrete values matching the SectionType's props schema. */
    props: Readonly<Record<string, unknown>>;
    /** Per-locale overrides on top of `props`. */
    localeOverrides?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
    sortOrder: number;
    status: LifecycleStatus;
    readonly audit: AuditTrail;
}
/**
 * A registered, reusable component definition. SectionTypes are platform- or
 * plugin-provided; never authored per-website. The registry is the single
 * source of truth for what can be placed on a page.
 */
export interface SectionType {
    readonly id: SectionTypeId;
    readonly key: MachineKey;
    name: string;
    description?: string;
    /** Semver of the section type implementation. */
    releaseVersion: VersionString;
    category: SectionCategoryValue;
    /** JSON-Schema-like props definition the builder validates against. */
    propsSchema: Readonly<Record<string, unknown>>;
    /** Whether this section can be used more than once per page. */
    allowMultiple: boolean;
    /** Theme support: whether the section renders without a custom theme. */
    renderWithoutTheme: boolean;
    isSystem: boolean;
    isActive: boolean;
    /** Optimistic concurrency version. Monotonically incremented on each save. */
    version: AggregateVersion;
    readonly audit: AuditTrail;
}
export declare enum SectionCategory {
    Layout = "layout",
    Content = "content",
    Media = "media",
    Interactive = "interactive",
    Commerce = "commerce",
    Embed = "embed",
    Ai = "ai"
}
type SectionCategoryValue = `${SectionCategory}`;
/** Locale override convenience type. */
export type LocaleOverrides = Readonly<Record<LocaleCode, Readonly<Record<string, unknown>>>>;
export {};
//# sourceMappingURL=types.d.ts.map