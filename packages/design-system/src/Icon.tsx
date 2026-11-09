import { type IconSize, iconClass } from "./icon.ts";
import { ICON_BOLD_PATHS, ICON_PATHS, ICON_VIEW_BOX, type IconName } from "./icons.ts";
import "../styles/icon.css";
import "../styles/glow.css";

interface Props {
  name: IconName;
  /** The glyph's box: medium beside words, large when it is the whole button. */
  size?: IconSize;
  /**
   * A hook for the control that holds it (a rule that places the glyph, or swaps it). An Astro page
   * passes className too: @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
}

/**
 * The Icon (DS-3): static, so it renders on the server with no client directive and ships no script.
 * A glyph with a bold twin draws both paths and the icon.bold token picks which shows (D274,
 * styles/icon.css).
 */
export default function Icon({ name, size = "md", className = "" }: Props) {
  const bold = ICON_BOLD_PATHS[name];
  const classes = [iconClass(size), className].filter(Boolean).join(" ");
  return (
    <svg
      className={classes}
      data-icon={name}
      viewBox={ICON_VIEW_BOX}
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICON_PATHS[name]} data-weight={bold ? "regular" : undefined} />
      {bold && <path d={bold} data-weight="bold" />}
    </svg>
  );
}
