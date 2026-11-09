/**
 * The Chip: the filter chip, a choice a person ticks, drawn as a pill (D237), and the group that
 * holds a row of them. The one place their classes are written. Chip.tsx and ChipGroup.tsx render
 * from it; a script that clones a chip reads CHIP_SELECTOR; the style guide lists CHIP. The rules are
 * in styles/primitives.css (and, on a drawer, styles/drawer.css).
 */
import type { Guidance } from "./guidance.ts";

export const CHIP: Guidance = {
  summary: "A checkbox drawn as a pill; ticked it takes the accent container.",
  useWhen: [
    "Tick several topics or categories to include.",
    "Filter a list by one or more kinds: the Library's Show chips.",
  ],
  dontUseWhen: [
    { when: "Exactly one of a few values.", instead: "Segmented choice" },
    { when: "The control switches the view of the same content.", instead: "Segmented navigation" },
    { when: "The choices are many, or long: they go in a list.", instead: "Select" },
    { when: "The pill plays a briefing or a story.", instead: "Play chip" },
  ],
};

/** Every class the Chip and its group draw, for the registry and its test. */
export const CHIP_CLASSES: string[] = ["filter-chip", "filter-chips", "filter-chips-scroll"];

/** Classes the Chip replaced; none may be written again, in any app that draws the system. */
export const CHIP_RETIRED: string[] = [];

/** A filter chip on a page, for a script that finds or clones one (its checkbox is a native input). */
export const CHIP_SELECTOR = ".filter-chip";
