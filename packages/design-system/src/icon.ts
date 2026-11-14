/**
 * The Icon: one Phosphor glyph, a single filled path that takes its colour from the text around it.
 * The one place its classes are written. Icon.tsx renders from it; a script or a React island that
 * draws one calls iconClass(); the style guide lists ICON. The rules are in styles/icon.css.
 */
import type { Guidance } from "./guidance.ts";

export type IconSize = "md" | "lg";

export const ICON: Guidance & { sizes: Record<IconSize, Guidance & { label: string }> } = {
  summary: "A filled Phosphor glyph in the colour of the text beside it.",
  useWhen: ["A mark beside a label or alone in a button: a chevron, a plus, a check, Play."],
  dontUseWhen: [
    {
      when: "The picture is an illustration, a logo or a cover.",
    },
    {
      when: "The glyph is a row's state (done, failed, cancelled) and the row also draws it as an action (Close, Remove): one glyph, one meaning, so the state takes its own.",
    },
    {
      when: "The glyph must act when pressed.",
      instead: "Icon button",
    },
  ],
  sizes: {
    md: {
      label: "Medium",
      summary: "24px: beside text, inside a row, a chip or a menu item.",
      useWhen: ["The glyph sits with words."],
      dontUseWhen: [{ when: "The glyph is the whole button.", instead: "Icon.lg" }],
    },
    lg: {
      label: "Large",
      summary: "The size of a lone glyph in a button, a bar or a tab.",
      useWhen: ["The glyph is the whole button: Close, More, a nav destination, Play."],
      dontUseWhen: [{ when: "The glyph sits beside a label.", instead: "Icon.md" }],
    },
  },
  experimental: [
    {
      option: "--icon-size",
      hook: "--icon-size",
      reason:
        "A control that holds a glyph sets its size once, on itself, so no page rule names the glyph: the transport's Play larger than everything around it and its skips (2026-10-22), the cover's bare Play on the scrim (owner, 2026-10-31), the Library's status mark sized from its text (owner, 2026-11-02 and 2026-11-03), and the queue ring's end check in the ring's own size (owner, 2026-11-12: keep it as it is).",
      since: "2026-11-12",
    },
  ],
};

/** Every class the Icon draws, for the registry and its test. */
export const ICON_CLASSES: string[] = ["icon-glyph", "icon-glyph-lg"];

/** Classes the Icon replaced; none may be written again, in any app that draws the system. */
export const ICON_RETIRED: string[] = ["ui-icon", "icon-lg"];

/** The classes of a glyph, for a script or an island that builds its own svg. */
export const iconClass = (size: IconSize = "md"): string =>
  size === "lg" ? "icon-glyph icon-glyph-lg" : "icon-glyph";
