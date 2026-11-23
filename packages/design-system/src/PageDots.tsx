import { pageDotsClass } from "./pageDots.ts";
import "../styles/page-dots.css";

interface Props {
  /** How many pages there are. One or fewer draws nothing. */
  count: number;
  /** The page showing, from 0. A page's script moves it with data-current on the dots. */
  current?: number;
  /** For placing the row, or a hook a page's script finds it by. Never its look. */
  className?: string;
}

/**
 * Page dots: one dot per page, the current one solid. Read as one picture ("Page 2 of 3"), since the
 * swipe, not the dots, moves the pages. Static: no client directive; a page's script that pages the
 * grid sets aria-current on the dot and the label with it.
 */
export default function PageDots({ count, current = 0, className }: Props) {
  if (count <= 1) return null;
  const at = Math.min(count - 1, Math.max(0, Math.trunc(current) || 0));
  return (
    <div
      className={[pageDotsClass(), className].filter(Boolean).join(" ")}
      role="img"
      aria-label={`Page ${at + 1} of ${count}`}
    >
      {Array.from({ length: count }, (_, page) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: the dots are positions, nothing else.
        <span key={page} aria-current={page === at ? "true" : undefined} />
      ))}
    </div>
  );
}
