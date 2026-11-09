import type { ReactNode } from "react";
import { badgeClass } from "./badge";
import "../styles/badge.css";

interface Props {
  /**
   * For placing the badge where it stands (a margin, a grid area). Never its look. An Astro page
   * passes className too: @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
  /** The one word or one number it holds. */
  children?: ReactNode;
}

/** The Badge (DS-3): static, so it renders on the server with no client directive and ships no script. */
export default function Badge({ className = "", children }: Props) {
  return <span className={[badgeClass(), className].filter(Boolean).join(" ")}>{children}</span>;
}
