/**
 * Page dots: which page of a paged grid is showing (the Dial swipes in pages of nine). The one place
 * its classes are written. PageDots.tsx renders from it; the style guide lists PAGE_DOTS. The rules
 * are in styles/page-dots.css.
 */
import type { Guidance } from "./guidance.ts";

export const PAGE_DOTS: Guidance = {
  summary:
    "A row of small dots under a grid that swipes in pages; the current page's dot is solid.",
  useWhen: ["A grid that pages sideways: Home's speed dial, nine to a page, three pages at most."],
  dontUseWhen: [
    { when: "Moving between sections of one page.", instead: "Segmented navigation" },
    { when: "There is one page: draw no dots." },
  ],
};

/** Every class the dots draw, for the registry and its test. */
export const PAGE_DOTS_CLASSES: string[] = ["page-dots-track"];

/** Classes the dots replaced; none may be written again, in any app that draws the system. */
export const PAGE_DOTS_RETIRED: string[] = [];

/** The class that draws the row, for a script or an island. */
export const pageDotsClass = (): string => "page-dots-track";
