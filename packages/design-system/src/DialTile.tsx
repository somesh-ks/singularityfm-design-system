import type { ButtonHTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes.ts";
import Badge from "./Badge.tsx";
import Icon from "./Icon.tsx";

interface DialTileProps {
  /** The show's name, written on the cover. */
  name: string;
  /**
   * What a press does, for a screen reader: "Play Hard Fork, 2 new". The name and count on the cover
   * are drawn for the eye only, so this is the tile's whole name.
   */
  label: string;
  /** New episodes; a word ("New") for a Catchup. Absent or 0 draws no badge. */
  count?: number | string;
  /** Pinned first by the person (the newest Daily always is). */
  pinned?: boolean;
  /** The tile whose show is playing now: the accent ring. The page's player sets data-playing. */
  playing?: boolean;
  /** Draws a link instead of a button, for a tile that opens a page. */
  href?: string;
  /**
   * For placing the tile, or a hook a page's script finds it by (data-play-item). Never its look. An
   * Astro page passes className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** The cover: an image or the app's own cover, filling the square. */
  children: ReactNode;
}

type Props = DialTileProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof DialTileProps>;

/**
 * One tile of the Dial: a square cover with the show's name along its foot, a pin at the top start,
 * the count at the top end, and the accent ring while it plays (blue marks what is active). The press
 * area is a native button (or a link with href) over the whole square, so it presses before any
 * script; the page's player writes data-playing on the tile. Static: no client directive.
 */
export default function DialTile({
  name,
  label,
  count,
  pinned = false,
  playing = false,
  href,
  className,
  children,
  ...passed
}: Props) {
  const rest = passedAttributes(passed);
  const inside = (
    <>
      <span className="dial-art">{children}</span>
      <span className="dial-name" aria-hidden="true">
        {name}
      </span>
    </>
  );
  return (
    <li
      className={["dial-tile", className].filter(Boolean).join(" ")}
      data-playing={String(playing)}
    >
      {href ? (
        <a className="dial-hit" href={href} aria-label={label} {...rest}>
          {inside}
        </a>
      ) : (
        <button className="dial-hit" type="button" aria-label={label} {...rest}>
          {inside}
        </button>
      )}
      {pinned && (
        <span className="dial-pin" aria-hidden="true">
          <Icon name="pinFill" />
        </span>
      )}
      {count !== undefined && count !== 0 && count !== "" && (
        <span className="dial-count" aria-hidden="true">
          <Badge>{count}</Badge>
        </span>
      )}
    </li>
  );
}
