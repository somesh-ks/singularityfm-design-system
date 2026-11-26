import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { passedAttributes } from "./attributes.ts";
import Icon from "./Icon.tsx";
import IconButton from "./IconButton.tsx";
import "../styles/resume-card.css";

interface ResumeCardProps {
  /** The episode's title. Two lines at most. */
  title: string;
  /** One line under the bar: the show and the time left ("Hard Fork · 12 min left"). */
  facts: string;
  /** How much is heard, 0 to 1. */
  progress: number;
  /** Play's name for a screen reader: "Resume The Jensen Huang Affair". */
  playLabel: string;
  /** Dismiss's name: "Remove from Continue listening". */
  dismissLabel: string;
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
 * The Resume card: native buttons for Play (tonal, the card's main action) and Dismiss (standard),
 * found by data-resume-play and data-resume-dismiss; the play glyph swaps to pause on data-playing
 * with no change in size. The bar is drawn for the eye: the facts say the time left in words. Static:
 * no client directive.
 */
export default function ResumeCard({
  title,
  facts,
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
  return (
    <article
      className={["resume-card-panel", className].filter(Boolean).join(" ")}
      data-playing={String(playing)}
      {...passedAttributes(passed)}
    >
      <span className="resume-card-art">{children}</span>
      <span className="resume-card-text">
        <span className="resume-card-title">{title}</span>
        <span
          className="resume-card-bar"
          aria-hidden="true"
          style={{ "--progress": heard } as CSSProperties}
        />
        <span className="resume-card-facts">{facts}</span>
      </span>
      <span className="resume-card-acts">
        <IconButton label={dismissLabel} data-resume-dismiss="">
          <Icon name="close" />
        </IconButton>
        <IconButton label={playLabel} variant="tonal" data-resume-play="">
          <span className="swap">
            <Icon name="play" className="swap-paused" />
            <Icon name="pause" className="swap-playing" />
          </span>
        </IconButton>
      </span>
    </article>
  );
}
