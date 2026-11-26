import { type ComponentProps, type CSSProperties, type ReactNode, useId } from "react";
import { passedAttributes } from "./attributes.ts";
import Icon from "./Icon.tsx";
import IconButton from "./IconButton.tsx";
import "../styles/resume-card.css";

interface ResumeCardProps {
  /** The episode's title. Two lines at most. */
  title: string;
  /**
   * The one line under the title, cut short when long: the show and the time left ("Hard Fork · 12 min
   * left"), or, with `remaining`, the show's name alone ("Hard Fork").
   */
  facts: string;
  /** The time left, after the facts and never cut short ("12 min left"). */
  remaining?: string;
  /** How much is heard, 0 to 1. */
  progress: number;
  /** The card's name for a screen reader, what a press does: "Resume The Jensen Huang Affair". */
  playLabel: string;
  /**
   * @deprecated The card draws no Dismiss (owner, 26 Nov: a shelf clears itself as episodes finish).
   * Passing it still draws one until 1.0.0 removes it.
   */
  dismissLabel?: string;
  /** Draws the pause glyph: this episode is playing. The page's player sets data-playing. */
  playing?: boolean;
  /**
   * For placing the card, or a hook a page's script finds it by. Never its look. An Astro page passes
   * className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** The cover, a small square. */
  children: ReactNode;
}

type Props = ResumeCardProps & Omit<ComponentProps<"article">, keyof ResumeCardProps>;

/**
 * The Resume card: the whole card is one native button that resumes (data-resume-play), with the play
 * glyph on the cover. It has no other control: the shelf clears itself as episodes finish (owner,
 * 26 Nov). A deprecated dismissLabel still draws a Dismiss at the top end, outside the press area. The glyph swaps to pause on data-playing with no change in size.
 * The bar is drawn for the eye: the facts say the time left in words. Static: no client directive.
 */
export default function ResumeCard({
  title,
  facts,
  remaining,
  progress,
  playLabel,
  dismissLabel,
  playing = false,
  className,
  children,
  ...passed
}: Props) {
  // A duration not yet known (0/0) reads as unheard, never as a full bar.
  const part = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  const heard = `${Math.round(part * 100)}%`;
  // playLabel names the action; the title, show and time left describe it, so a screen reader hears
  // which episode and how much is left as well as what a press does.
  const text = useId();
  return (
    <article
      className={["resume-card-panel", className].filter(Boolean).join(" ")}
      data-playing={String(playing)}
      {...passedAttributes(passed)}
    >
      <button
        className="resume-card-hit"
        type="button"
        aria-label={playLabel}
        aria-describedby={text}
        data-resume-play=""
      >
        <span className="resume-card-art">
          {children}
          <span className="resume-card-glyph swap" aria-hidden="true">
            <Icon name="play" className="swap-paused" />
            <Icon name="pause" className="swap-playing" />
          </span>
        </span>
        <span className="resume-card-text" id={text}>
          <span className="resume-card-title">{title}</span>
          <span className="resume-card-facts">
            <span className="resume-card-show">{facts}</span>
            {remaining && <span className="resume-card-left">{remaining}</span>}
          </span>
          <span
            className="resume-card-bar"
            aria-hidden="true"
            style={{ "--progress": heard } as CSSProperties}
          />
        </span>
      </button>
      {dismissLabel && (
        <IconButton label={dismissLabel} className="resume-card-dismiss" data-resume-dismiss="">
          <Icon name="close" />
        </IconButton>
      )}
    </article>
  );
}
