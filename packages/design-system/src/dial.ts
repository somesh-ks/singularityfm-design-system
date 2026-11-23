/**
 * The Dial: Home's speed dial, a grid of show covers with the show's name on the cover, a pin, a
 * count of new episodes and a ring on the one that is playing. A press plays where it does not open
 * a page. The one place its classes are written. Dial.tsx and DialTile.tsx render from it; the style
 * guide lists DIAL. The rules are in styles/dial.css.
 */
import type { Guidance } from "./guidance.ts";

export const DIAL: Guidance = {
  summary: "A grid of covers with the name on each, a pin, a count and a ring on the one playing.",
  useWhen: [
    "The shows a person keeps closest, where one press plays the newest unheard episode.",
    "Nine at most on a phone page (three by three), six across on a wide screen.",
  ],
  dontUseWhen: [
    { when: "A press opens the item's page, with its title and facts under the cover." },
    { when: "A choice of topics a person ticks.", instead: "Topic tile" },
  ],
};

/** Every class the Dial and its tiles draw, for the registry and its test. */
export const DIAL_CLASSES: string[] = [
  "dial-grid",
  "dial-grid-wide",
  "dial-tile",
  "dial-hit",
  "dial-art",
  "dial-name",
  "dial-pin",
  "dial-count",
];

/** Classes the Dial replaced; none may be written again, in any app that draws the system. */
export const DIAL_RETIRED: string[] = [];

/** The grid's classes; `wide` sets six across, for a wide column. */
export const dialClass = (wide = false): string =>
  wide ? "dial-grid dial-grid-wide" : "dial-grid";
