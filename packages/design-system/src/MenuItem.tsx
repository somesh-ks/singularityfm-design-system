import type { ButtonHTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes";
import { type MenuItemTone, menuItemClass } from "./menu";
import "../styles/menu.css";

interface MenuItemProps {
  /** The danger tone, for the one row that destroys. */
  tone?: MenuItemTone;
  /**
   * For placing the row where it stands, or a hook a script finds it by. Never its look. An Astro page
   * passes className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** Astro places the row in its parent's slot with it; it is not an attribute of the row. */
  slot?: string;
  /** The row's glyph first, then its words. */
  children?: ReactNode;
}

type Props = MenuItemProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof MenuItemProps | "role">;

/**
 * One row of a Menu (DS-8): a native button with the menuitem role, rendered on the server with no
 * client directive and no script. What a pick does is the page's: its script hears the row's click.
 */
export default function MenuItem({
  tone,
  className,
  type = "button",
  slot: _slot,
  children,
  ...passed
}: Props) {
  return (
    <button
      className={[menuItemClass(tone), className].filter(Boolean).join(" ")}
      type={type}
      role="menuitem"
      {...passedAttributes(passed)}
    >
      {children}
    </button>
  );
}
