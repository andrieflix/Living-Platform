/**
 * Builder bounded context — authoring-surface domain concepts.
 *
 * Reserved for future development. Currently re-exports the canvas payload
 * types that the application-layer BuilderService operates on, so the domain
 * owns the vocabulary even though orchestration lives in @livingsites/application.
 */
import type { PageId, SectionId } from "../shared";
import type { Page } from "../page/types";
import type { Section } from "../section/types";
/**
 * Aggregate payload for the builder canvas. The application layer's
 * BuilderService.loadCanvas returns this shape; the domain owns its definition
 * so it isn't invented in the application layer.
 */
export interface BuilderCanvas {
    readonly page: Page;
    readonly sections: readonly Section[];
    /** Section types available to add (filtered by theme + plan). */
    readonly availableSectionTypes: readonly {
        key: string;
        name: string;
        category: string;
    }[];
    readonly mediaRecentlyUploaded: readonly {
        id: string;
        filename: string;
        url: string;
        mimeType: string;
    }[];
}
/**
 * Declarative description of where to place a new or moved section.
 * The builder UI produces this; the application layer interprets it.
 */
export type PlacementTarget = {
    kind: "top";
} | {
    kind: "bottom";
} | {
    kind: "after";
    sectionId: SectionId;
} | {
    kind: "before";
    sectionId: SectionId;
} | {
    kind: "replace";
    sectionId: SectionId;
};
/** Intent to add a section of a given type at a placement target. */
export interface AddSectionIntent {
    readonly pageId: PageId;
    readonly sectionTypeKey: string;
    readonly target: PlacementTarget;
    readonly props?: Record<string, unknown>;
}
/** Intent to move an existing section to a new placement. */
export interface MoveSectionIntent {
    readonly sectionId: SectionId;
    readonly target: PlacementTarget;
}
//# sourceMappingURL=index.d.ts.map