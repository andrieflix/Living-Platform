/**
 * Navigation bounded context — menus and menu items for a website.
 *
 * Split out of the website context to isolate the menu-modeling concern.
 * A website may have multiple menus (header, footer, mobile). MenuItems
 * target pages, URLs, media, or sections, and support nesting.
 */
import type { WebsiteId, Slug, AuditTrail, AggregateVersion } from "../shared";
/** Top-level navigation menu for a website. */
export interface Navigation {
    readonly id: string;
    readonly websiteId: WebsiteId;
    readonly key: Slug;
    name: string;
    /** Ordered list of items; order reflects display order. */
    items: readonly MenuItem[];
    /** Optimistic concurrency version. Monotonically incremented on each save. */
    version: AggregateVersion;
    readonly audit: AuditTrail;
}
/** A single entry in a navigation menu. */
export interface MenuItem {
    readonly id: string;
    readonly navigationId: string;
    label: string;
    /** Target: internal page slug, external URL, or media download. */
    target: MenuTarget;
    /** Optional icon key resolved by the rendering layer. */
    iconKey?: string;
    /** Whether to open the link in a new tab. */
    openInNewTab: boolean;
    /** Child items for nested menus. */
    children?: readonly MenuItem[];
    /** Sort order within the parent. */
    sortOrder: number;
}
/** Discriminated target for a menu item. */
export type MenuTarget = {
    kind: "page";
    pageSlug: string;
} | {
    kind: "url";
    href: string;
} | {
    kind: "media";
    mediaId: string;
} | {
    kind: "section";
    pageId: string;
    sectionId: string;
};
//# sourceMappingURL=types.d.ts.map