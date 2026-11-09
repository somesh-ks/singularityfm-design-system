import { flagBadgeClass, flagClass, flagParts, flagSrc, hasFlagArt } from "./flag.ts";
import "../styles/flag.css";

interface Props {
  /** An ISO 3166-1 code: the flag alone, at the 16 by 12 of a row of controls. */
  region?: string;
  /** Text that may hold flag emoji: its flags drawn at the size of the words. */
  text?: string;
}

/**
 * The Flag (flag.ts, D367, DS-3), static: a region's flag, or text whose flag emoji are drawn as
 * flags (a topic's emoji). The text itself goes on the element that holds it as data-text (flag.ts
 * showText), so a script reads it back the same way after a change. It draws no element of its own
 * around the parts, so it takes no className: the element that holds it is the one to place.
 */
export default function Flag({ region, text = "" }: Props) {
  const parts = region ? [{ region }] : flagParts(text);
  return parts.map((part, index) =>
    typeof part === "string" ? (
      part
    ) : !hasFlagArt(part.region) ? (
      <span
        // biome-ignore lint/suspicious/noArrayIndexKey: drawn once and never reordered; a region can repeat.
        key={index}
        className={flagBadgeClass(region === undefined)}
        data-code={part.region}
        aria-hidden="true"
      />
    ) : (
      <img
        // biome-ignore lint/suspicious/noArrayIndexKey: drawn once and never reordered; a region can repeat.
        key={index}
        className={flagClass(region === undefined)}
        src={flagSrc(part.region)}
        alt=""
        aria-hidden="true"
        decoding="async"
        loading="lazy"
      />
    ),
  );
}
