import type { InputHTMLAttributes } from "react";
import { passedAttributes } from "./attributes.ts";
import Icon from "./Icon.tsx";
import "../styles/show-pick.css";

interface ShowPickProps {
  /** The show's name, under its cover. A script that fills a cloned card writes [data-show-pick-title]. */
  title: string;
  /** The quiet line under the name (who makes it). Filled by a script at [data-show-pick-facts]. */
  facts?: string;
  /** The cover's address. Filled by a script at [data-show-pick-cover]. */
  cover?: string;
  /** For placing the card, or a hook a page's script finds it by. Never its look. */
  className?: string;
}

type Props = ShowPickProps & Omit<InputHTMLAttributes<HTMLInputElement>, keyof ShowPickProps>;

/**
 * A show to pick (first run): a gallery card, cover over name over a quiet line, that is a native
 * checkbox. Picked, the cover wears the accent ring and a check in a fixed slot, so picking moves
 * nothing. One list item; the page's grid places it. Static: no client directive.
 */
export default function ShowPick({ title, facts, cover, className, ...passed }: Props) {
  return (
    <li className="show-pick-cell">
      <label className={["show-pick", className].filter(Boolean).join(" ")}>
        <input type="checkbox" {...passedAttributes(passed)} />
        <span className="show-pick-art">
          <img
            src={cover || undefined}
            alt=""
            loading="lazy"
            decoding="async"
            data-show-pick-cover
          />
          <span className="show-pick-check" aria-hidden="true">
            <Icon name="check" />
          </span>
        </span>
        <span className="show-pick-title" data-show-pick-title>
          {title}
        </span>
        <span className="show-pick-facts" data-show-pick-facts>
          {facts}
        </span>
      </label>
    </li>
  );
}
