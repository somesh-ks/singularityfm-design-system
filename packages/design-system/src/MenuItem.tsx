import { Menu as BaseMenu } from "@base-ui/react/menu";
import { type ButtonHTMLAttributes, createContext, type ReactNode, useContext } from "react";
import { passedAttributes } from "./attributes";
import { type MenuItemTone, menuItemClass } from "./menu";
import "../styles/menu.css";

/** True inside a Menu: a row there is Base UI's item. Menu.tsx provides it. */
export const InMenu = createContext(false);

interface MenuItemProps {
  /** The danger tone, for the one row that destroys. */
  tone?: MenuItemTone;
  /** A pick closes the menu; false keeps it open (a tile that turns where it is, as Favorite on a phone). */
  closeOnClick?: boolean;
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
 * One row of a Menu (DS-4): inside a Menu it is Base UI's Menu.Item on a native button, so the menu's
 * arrow keys, Home and End, typeahead and a pick's close are Base UI's. Outside one (the deprecated
 * Menu.astro's popover, a picture of a row) it is the same button with nothing of Base UI's, and
 * ships no script.
 */
export default function MenuItem({
  tone,
  closeOnClick,
  className,
  type = "button",
  slot: _slot,
  children,
  ...passed
}: Props) {
  const inMenu = useContext(InMenu);
  const classes = [menuItemClass(tone), className].filter(Boolean).join(" ");
  const rest = passedAttributes(passed);
  if (!inMenu)
    return (
      <button className={classes} type={type} role="menuitem" {...rest}>
        {children}
      </button>
    );
  return (
    <BaseMenu.Item
      {...rest}
      className={classes}
      closeOnClick={closeOnClick}
      nativeButton
      render={<button type={type} />}
    >
      {children}
    </BaseMenu.Item>
  );
}
