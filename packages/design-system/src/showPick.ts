/**
 * The Show pick: a show's gallery card that is a checkbox, for following shows at first run. The one
 * place its classes are written. ShowPick.tsx renders from it; the style guide lists SHOW_PICK. The
 * rules are in styles/show-pick.css.
 */
import type { Guidance } from "./guidance.ts";

export const SHOW_PICK: Guidance = {
  summary: "A show's cover, name and maker as one checkbox, ringed in the accent when picked.",
  useWhen: ["Pick several shows to follow from a grid of them, at first run."],
  dontUseWhen: [
    { when: "Open a show's page or play it.", instead: "Dial" },
    { when: "Choose topics, not shows.", instead: "Topic tile" },
  ],
};

/** Every class the card draws, for the registry and its test. */
export const SHOW_PICK_CLASSES: string[] = [
  "show-pick-cell",
  "show-pick",
  "show-pick-art",
  "show-pick-check",
  "show-pick-title",
  "show-pick-facts",
];

/** Classes the card replaced; none may be written again, in any app that draws the system. */
export const SHOW_PICK_RETIRED: string[] = [];
