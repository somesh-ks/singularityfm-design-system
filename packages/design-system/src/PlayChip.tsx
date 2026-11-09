import type { ButtonHTMLAttributes } from "react";
import { passedAttributes } from "./attributes.ts";
import Icon from "./Icon.tsx";
import type { PlayChipState } from "./playChip.ts";

interface PlayChipProps {
  /** The visible words: a length such as "1:24", or a state such as "Playing". */
  label: string;
  /** Where the item stands; the player rewrites it (buttons.css documents each). */
  state?: PlayChipState;
  /**
   * For placing the chip where it stands, or a hook a page's rule finds it by. Never its look. An
   * Astro page passes className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** Astro places the chip in its parent's slot with it; it is not an attribute of the button. */
  slot?: string;
}

type Props = PlayChipProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof PlayChipProps>;

/**
 * The Play chip (D237, DS-8): a native button, React-rendered with no client directive, so it
 * presses before any script and a page's player writes its state on it as it plays: data-state,
 * data-playing and the words in [data-chip-label]. Its glyph slot holds every mark and the state
 * picks the one that shows; the words share a cell with a hidden "Play again", so the chip keeps
 * its width. Pass the hooks the player reads (data-play-item) and its name (aria-label).
 */
export default function PlayChip({
  label,
  state = "idle",
  className,
  type = "button",
  slot: _slot,
  ...passed
}: Props) {
  return (
    <button
      className={["chip", className].filter(Boolean).join(" ")}
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
        <span className="chip-bars">
          <i />
          <i />
          <i />
        </span>
        <Icon name="check" className="chip-check" />
        <Icon name="replay" className="chip-replay" />
        <Icon name="refresh" className="chip-refresh" />
        <span className="spinner" />
      </span>
      <span className="chip-text">
        <span className="chip-label" data-chip-label="">
          {label}
        </span>
        <span className="chip-again" aria-hidden="true">
          Play again
        </span>
      </span>
    </button>
  );
}
