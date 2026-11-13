import type { ButtonHTMLAttributes } from "react";
import { passedAttributes } from "./attributes.ts";
import Icon from "./Icon.tsx";
import PlayingBars from "./PlayingBars.tsx";
import { type PlayChipState, playChipClass } from "./playChip.ts";

interface PlayChipProps {
  /**
   * The visible words: a length such as "1:24", or a state such as "Playing". Leave it out for the
   * glyph alone, a round button that never changes size, whose name is its aria-label (then required,
   * and the page's player rewrites it with each state): a story's Play and the hero's (owner,
   * 2026-11-13: "the play button in the hero should be just the icon button").
   */
  label?: string;
  /** Where the item stands; the player rewrites it (buttons.css documents each). */
  state?: PlayChipState;
  /**
   * The widest words the chip will ever show ("Processing"). The chip is as wide as these in every
   * state; words longer than them are cut with an ellipsis.
   * @deprecated Buttons hug their words (owner, 2026-11-13: "in general buttons should hug text"; DS-13).
   *   Drop it: the words set the width. It still works until 1.0.0 removes it.
   */
  reserve?: string;
  /**
   * The page's one main Play: the primary fill, and the pause glyph while it plays instead of the bars.
   * Experimental (DS-11): it may change or go in a minor release (playChip.ts says why it exists).
   */
  primary?: boolean;
  /**
   * For placing the chip where it stands, or a hook a page's rule finds it by. Never its look. An
   * Astro page passes className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** Astro places the chip in its parent's slot with it; it is not an attribute of the button. */
  slot?: string;
}

/** With no words, the name is all a screen reader has, so it is required. */
type Named = { label: string; "aria-label"?: string } | { label?: undefined; "aria-label": string };

type Props = PlayChipProps &
  Named &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof PlayChipProps | "aria-label">;

/**
 * The Play chip (D237, DS-8): a native button, React-rendered with no client directive, so it
 * presses before any script and a page's player writes its state on it as it plays: data-state,
 * data-playing and the words in [data-chip-label]. Its glyph slot is one fixed box that holds every
 * mark, and the state picks the one that shows, so a mark that swaps never moves anything (DS-9). The
 * chip hugs its words (DS-13); with no words it is the glyph alone. Pass the hooks the player reads
 * (data-play-item) and its name (aria-label).
 */
export default function PlayChip({
  label,
  state = "idle",
  reserve,
  primary = false,
  className,
  type = "button",
  slot: _slot,
  ...passed
}: Props) {
  return (
    <button
      className={[playChipClass(primary, !label), className].filter(Boolean).join(" ")}
      type={type}
      data-state={state}
      data-playing="false"
      {...passedAttributes(passed)}
    >
      <span className="chip-glyph" aria-hidden="true">
        <span className="swap">
          <Icon name="play" className="swap-paused" />
          <Icon name="pause" className="swap-playing" />
        </span>
        <PlayingBars />
        <Icon name="check" className="chip-check" />
        <Icon name="replay" className="chip-replay" />
        <Icon name="refresh" className="chip-refresh" />
        <span className="spinner" />
      </span>
      {label && (
        <span className="chip-text" data-reserve={reserve}>
          <span className="chip-label" data-chip-label="">
            {label}
          </span>
        </span>
      )}
    </button>
  );
}
