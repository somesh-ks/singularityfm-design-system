/**
 * The Segmented choice: one outlined pill of radios, to pick exactly one value (D132, D243). The one
 * place its classes are written. SegmentedChoice.tsx renders from it; the style guide lists
 * SEGMENTED_CHOICE. The rules are in styles/primitives.css.
 */
import type { Guidance } from "./guidance";

export const SEGMENTED_CHOICE: Guidance = {
  summary: "One pill of radio items: pick exactly one value.",
  useWhen: ["Choose one of two to four short values: Length, Format, Tone."],
  dontUseWhen: [
    { when: "Switching between views.", instead: "Segmented navigation" },
    { when: "Several may be ticked together.", instead: "Chip" },
    { when: "The values are more than four, or long.", instead: "Select" },
  ],
};

/** Every class the Segmented choice draws, for the registry and its test. */
export const SEGMENTED_CHOICE_CLASSES: string[] = ["segmented-choice", "segmented-choice-item"];

/** Classes the Segmented choice replaced; none may be written again, in any app that draws the system. */
export const SEGMENTED_CHOICE_RETIRED: string[] = [];
