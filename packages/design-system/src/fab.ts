/**
 * The FAB, the floating action button: the page's one primary action below 64rem. The one place its
 * classes are written. Fab.tsx renders from it; a script that folds it or keeps clear of it reads FAB_SELECTOR;
 * the style guide lists FAB. The rules are in styles/fab.css, which Fab.tsx imports.
 */
import type { Guidance } from "./guidance";

export const FAB: Guidance = {
  summary: "The page's one primary action below 64rem: a glyph and a word, floating.",
  useWhen: ["One creating action a phone needs in reach: Catch up, Add a source."],
  dontUseWhen: [
    { when: "The action sits in a form or a sheet.", instead: "Button.filled" },
    {
      when: "From 64rem: the side column or the page carries the action as a button.",
      instead: "Button.tonal",
    },
    { when: "The action is one glyph with no word.", instead: "Icon button" },
  ],
};

/** Every class the FAB draws, for the registry and its test. */
export const FAB_CLASSES: string[] = ["create-fab", "create-fab-label"];

/** Classes the FAB replaced; none may be written again, in any app that draws the system. */
export const FAB_RETIRED: string[] = [];

/** The FAB on a page, for a script that folds it (data-folded) or keeps clear of it. */
export const FAB_SELECTOR = ".create-fab";
