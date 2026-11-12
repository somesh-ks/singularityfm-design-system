/**
 * The Play chip: the tonal pill that plays a briefing or one story and shows where it stands (D237).
 * The one place its classes are written. PlayChip.tsx renders from it; the reader's player writes its
 * state (data-state, data-playing and the label's words) on the element it finds by
 * PLAY_CHIP_SELECTOR; the style guide lists PLAY_CHIP. The rules are in styles/buttons.css.
 */
import type { Guidance } from "./guidance.ts";

export type PlayChipState = "idle" | "current" | "played" | "preparing" | "error" | "unavailable";

export const PLAY_CHIP: Guidance = {
  summary: "The tonal pill that plays a briefing or one story, with its state.",
  useWhen: ["Play an episode or a story and show idle, current, played, error or preparing."],
  dontUseWhen: [
    { when: "A person ticks a choice.", instead: "Chip" },
    {
      when: "The page's one main Play floats over it on a phone.",
      instead: "FAB",
    },
    { when: "The action is not playing something.", instead: "Button.tonal" },
  ],
  experimental: [
    {
      option: "primary",
      hook: "chip-primary",
      reason:
        "The page's one main Play (the hero's) takes the primary fill, idle and current, and shows the pause glyph while it plays, not the bars (owner, 2026-11-04: \"all should have the same color synchronized\"; D77). It has a button's face, not a chip's (owner, 2026-11-12: \"a button instead, not a chip. And keep its size\"): a step under the touch size, a button's end padding and the filled button's press corner.",
      since: "2026-11-12",
    },
  ],
};

/** Every class the Play chip draws, for the registry and its test. */
export const PLAY_CHIP_CLASSES: string[] = [
  "chip",
  "chip-primary",
  "chip-glyph",
  "chip-bars",
  "chip-check",
  "chip-replay",
  "chip-refresh",
  "chip-text",
  "chip-label",
  "chip-again",
];

/** Classes the Play chip replaced; none may be written again, in any app that draws the system. */
export const PLAY_CHIP_RETIRED: string[] = [];

/** The classes of a play chip; `primary` (experimental, DS-11) for the page's one main Play. */
export const playChipClass = (primary = false): string => (primary ? "chip chip-primary" : "chip");

/** A play chip on a page, for the script that writes its state. */
export const PLAY_CHIP_SELECTOR = ".chip";
