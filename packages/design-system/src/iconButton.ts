/**
 * The Icon button: a glyph in a round 44px target, its variants and when to use each. The one place
 * its classes are written. IconButton.tsx renders from it; a script or a React island that draws one
 * (a Base UI Close, a string-built row) calls iconButtonClass(); the style guide lists ICON_BUTTON.
 * The rules are in styles/buttons.css; the press is the .press utility in foundations.css.
 */
import type { Guidance } from "./guidance.ts";

export type IconButtonVariant = "standard" | "tonal" | "filled";

export const ICON_BUTTON: Guidance & {
  variants: Record<IconButtonVariant, Guidance & { label: string }>;
} = {
  summary: "A glyph in a round 44px target, quiet until used.",
  useWhen: [
    "One glyph says what it does: Close, Back, More, Share.",
    "A row's dots menu, or the Close of a sheet.",
  ],
  dontUseWhen: [
    { when: "The action needs a word to be understood.", instead: "Button.text" },
    { when: "The action floats over the page.", instead: "FAB" },
    {
      when: "A row would carry several of them: its actions go in a dots menu at its end.",
      instead: "Menu",
    },
  ],
  variants: {
    standard: {
      label: "Standard",
      summary: "The glyph alone in muted ink; a state layer shows on hover and press.",
      useWhen: [
        "A toolbar glyph, a sheet's Close, a row's dots or its end action.",
        "Many rows repeat it.",
      ],
      dontUseWhen: [
        {
          when: "It is the companion of a primary action: Share beside Play.",
          instead: "Icon button.tonal",
        },
      ],
    },
    tonal: {
      label: "Tonal",
      summary: "A circle on the container fill, beside a primary action.",
      useWhen: ["The companion of a primary action in one row: Share beside Play."],
      dontUseWhen: [
        { when: "A lone toolbar glyph, or one in every row.", instead: "Icon button.standard" },
      ],
    },
    filled: {
      label: "Filled",
      summary: "A circle in the primary fill: a glyph that is the primary action.",
      useWhen: ["A lone glyph is the place's one primary action: the queue's Start listening."],
      dontUseWhen: [
        { when: "The primary action has words.", instead: "Button.filled" },
        { when: "It is the companion of a primary action.", instead: "Icon button.tonal" },
      ],
    },
  },
  experimental: [
    {
      option: 'variant="filled"',
      hook: "icon-btn-filled",
      reason:
        'The queue\'s Start listening is a Play, so it wears the primary fill with its own hover and press (owner, 2026-11-04: "every primary button one colour").',
      since: "2026-11-12",
    },
  ],
};

/** Every class the Icon button draws, for the registry and its test. */
export const ICON_BUTTON_CLASSES: string[] = [
  "icon-btn",
  "icon-btn-tonal",
  "icon-btn-filled",
  "icon-btn-end",
];

/** Classes the Icon button replaced; none may be written again, in any app that draws the system. */
export const ICON_BUTTON_RETIRED: string[] = [];

/**
 * The classes of an icon button: the variant, and `rowEnd` for one that ends a row (its glyph's ink
 * lands where the words of the rows around it end, D187). Always with .press, the system's press.
 */
export const iconButtonClass = (variant: IconButtonVariant = "standard", rowEnd = false): string =>
  ["icon-btn", variant !== "standard" && `icon-btn-${variant}`, rowEnd && "icon-btn-end", "press"]
    .filter(Boolean)
    .join(" ");
