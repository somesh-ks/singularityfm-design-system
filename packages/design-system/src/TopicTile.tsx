import type { CSSProperties, InputHTMLAttributes } from "react";
import { passedAttributes } from "./attributes.ts";
import Icon from "./Icon.tsx";
import "../styles/topic-tile.css";

interface TopicTileProps {
  /** The topic's name. */
  name: string;
  /** Up to three cover images from the topic, by address, fanned into the bottom end from the corner. */
  covers?: readonly string[];
  /** The tile's fill, a colour taken from its first cover; the container grey when absent. */
  tint?: string;
  /** Opens the topic's page. Without it the tile is a checkbox (first run). */
  href?: string;
  /** For placing the tile, or a hook a page's script finds it by. Never its look. */
  className?: string;
}

type Props = TopicTileProps & Omit<InputHTMLAttributes<HTMLInputElement>, keyof TopicTileProps>;

/**
 * One Topic tile in a TopicGrid: the name at the top start, up to three covers tipped into the bottom end.
 * With href it is a link; without, a native checkbox drawn as the tile, ticked with the accent ring
 * and a check in a fixed slot, so ticking moves nothing. Static: no client directive.
 */
export default function TopicTile({ name, covers = [], tint, href, className, ...passed }: Props) {
  const style = tint ? ({ "--topic-tint": tint } as CSSProperties) : undefined;
  const art = covers.slice(0, 3).map((src) => <img key={src} src={src} alt="" loading="lazy" />);
  const classes = ["topic-tile-hit", className].filter(Boolean).join(" ");
  return (
    <li className="topic-cell">
      {href ? (
        <a className={classes} href={href} style={style} {...passedAttributes(passed)}>
          <span className="topic-tile-name">{name}</span>
          {art}
        </a>
      ) : (
        <label className={classes} style={style}>
          <input type="checkbox" {...passedAttributes(passed)} />
          <span className="topic-tile-name">{name}</span>
          <span className="topic-tile-check" aria-hidden="true">
            <Icon name="check" />
          </span>
          {art}
        </label>
      )}
    </li>
  );
}
