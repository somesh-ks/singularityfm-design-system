import Icon from "./Icon.tsx";
import IconButton from "./IconButton.tsx";
import { pageArrowsClass } from "./pageDots.ts";
import "../styles/page-dots.css";

interface Props {
  /** The id of the row it moves: a Dial, a TopicGrid or a shelf that scrolls sideways. */
  controls: string;
  /** What Back says to a screen reader: "Earlier shows". */
  prevLabel: string;
  /** What Next says: "More shows". */
  nextLabel: string;
  /** For placing the pair, or a hook a page's script finds it by. Never its look. */
  className?: string;
}

/**
 * Page arrows: Back and Next at a section head's end, for a row that scrolls sideways. Only where a
 * pointer can hover; a finger swipes the row and sees none. Static: installPageArrows() moves the row
 * a page at a time and turns an arrow off at its end.
 */
export default function PageArrows({ controls, prevLabel, nextLabel, className }: Props) {
  return (
    <span className={[pageArrowsClass(), className].filter(Boolean).join(" ")}>
      <IconButton label={prevLabel} aria-controls={controls} data-page-prev="" disabled>
        <Icon name="chevronLeft" />
      </IconButton>
      <IconButton label={nextLabel} aria-controls={controls} data-page-next="">
        <Icon name="chevronRight" />
      </IconButton>
    </span>
  );
}
