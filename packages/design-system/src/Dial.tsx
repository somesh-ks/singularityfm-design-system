import type { HTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes.ts";
import { dialClass } from "./dial.ts";
import "../styles/dial.css";

interface DialProps {
  /** Six across instead of three, for a wide column (desktop). */
  wide?: boolean;
  /**
   * For placing the grid where it stands, or a hook a page's script finds it by. Never its look. An
   * Astro page passes className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** Astro places the grid in its parent's slot with it; it is not an attribute of the list. */
  slot?: string;
  /** The DialTiles, one page of them. */
  children: ReactNode;
}

type Props = DialProps & Omit<HTMLAttributes<HTMLUListElement>, keyof DialProps>;

/**
 * The Dial (Home's speed dial): a list of DialTiles in a square grid, three across or six. Static: no
 * script and no client directive. A page that pages it (nine a page) draws PageDots under it.
 */
export default function Dial({ wide = false, className, slot: _slot, children, ...passed }: Props) {
  return (
    <ul
      className={[dialClass(wide), className].filter(Boolean).join(" ")}
      {...passedAttributes(passed)}
    >
      {children}
    </ul>
  );
}
