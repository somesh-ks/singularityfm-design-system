import type { HTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes.ts";
import { topicGridClass } from "./topicTile.ts";
import "../styles/topic-tile.css";

interface TopicGridProps {
  /** Four across instead of two, for a wide column (desktop). */
  wide?: boolean;
  /** For placing the grid, or a hook a page's script finds it by. Never its look. */
  className?: string;
  /** The TopicTiles. */
  children: ReactNode;
}

type Props = TopicGridProps & Omit<HTMLAttributes<HTMLUListElement>, keyof TopicGridProps>;

/** A list of TopicTiles, two across or four, 8px apart (16px wide). Static: no client directive. */
export default function TopicGrid({ wide = false, className, children, ...passed }: Props) {
  return (
    <ul
      className={[topicGridClass(wide), className].filter(Boolean).join(" ")}
      {...passedAttributes(passed)}
    >
      {children}
    </ul>
  );
}
