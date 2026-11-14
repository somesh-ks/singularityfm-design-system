import type { ReactNode } from "react";
import Icon from "./Icon.tsx";
import IconButton from "./IconButton.tsx";
import { menuBodyClass, menuListClass } from "./menu.ts";
import { sheetHeadClass, sheetHeadingClass, sheetSubtitleClass, sheetTitleClass } from "./sheet.ts";
import "../styles/menu.css";

interface MenuProps {
  /** The popover's id: the button that opens it names it with popoverTarget. */
  id: string;
  /** The sheet's header on a phone, and the menu's name for a screen reader. */
  title: string;
  /** A quiet line under the title on a phone's sheet, such as a card's facts. */
  subtitle?: string;
  /**
   * No padding above and below the list, for a host that draws its own header and body in the menu's
   * surface. Experimental (DS-11): it may change or go in a minor release (menu.ts says why it exists).
   */
  flush?: boolean;
  /**
   * For placing the popover under its own button (the anchor of a row or a story). Never its look. An
   * Astro page passes className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** The rows: MenuItem, and a tiles row of them. */
  children?: ReactNode;
}

/**
 * Every ⋮ menu (2026-10-21, DS-8): a native popover, rendered whole on the server with no client
 * directive, which a button opens with popoverTarget before any script. A phone shows it as a bottom
 * sheet with this header and a scrim, and from 40rem as the small menu under its button (menu.css);
 * light dismiss and Escape are the browser's. The rows are MenuItem buttons, each with its icon at the
 * start; the arrow keys, focus and the header's Close are the page's script (the app's heroMenu.ts).
 */
export default function Menu({
  id,
  title,
  subtitle,
  flush = false,
  className,
  children,
}: MenuProps) {
  const heading = (
    <h2 className={sheetTitleClass()} id={`${id}-title`}>
      {title}
    </h2>
  );
  return (
    <div
      className={[menuListClass(true, flush), className].filter(Boolean).join(" ")}
      id={id}
      popover="auto"
    >
      <div className={sheetHeadClass()}>
        {subtitle ? (
          <div className={sheetHeadingClass()}>
            {heading}
            <p className={sheetSubtitleClass()}>{subtitle}</p>
          </div>
        ) : (
          heading
        )}
        <IconButton label="Close" data-menu-close>
          <Icon name="close" size="lg" />
        </IconButton>
      </div>
      <div className={menuBodyClass()} role="menu" aria-label={title}>
        {children}
      </div>
    </div>
  );
}
