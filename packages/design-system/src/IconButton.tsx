import type { ButtonHTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes";
import { type IconButtonVariant, iconButtonClass } from "./iconButton";

interface IconButtonProps {
  /** What a press does, for a screen reader: the glyph has no words ("Close", "Share"). */
  label: string;
  /** Standard (the default) or tonal, the circle beside a primary action (iconButton.ts). */
  variant?: IconButtonVariant;
  /** It ends a row: its glyph's ink lands where the words of the rows around it end (D187). */
  rowEnd?: boolean;
  /** Draws a link instead of a button, for a glyph that goes to an address (Back). */
  href?: string;
  /**
   * For placing the button where it stands, or a hook a page's rule or script finds it by. Never its
   * look. An Astro page passes className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** Astro places the button in its parent's slot with it; it is not an attribute of the button. */
  slot?: string;
  /** The glyph: an Icon, or two that the button's state swaps between. */
  children: ReactNode;
}

type Props = IconButtonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof IconButtonProps>;

/**
 * The Icon button (DS-3): static, so it renders on the server with no client directive and ships no
 * script. No Base UI yet: a native button or link has every behaviour it needs (DS-4 moves it onto
 * Base UI on the 1.0.0-next line).
 */
export default function IconButton({
  label,
  variant = "standard",
  rowEnd = false,
  href,
  className,
  type = "button",
  slot: _slot,
  children,
  ...passed
}: Props) {
  const rest = passedAttributes(passed);
  const classes = [iconButtonClass(variant, rowEnd), className].filter(Boolean).join(" ");
  return href ? (
    <a className={classes} href={href} aria-label={label} {...rest}>
      {children}
    </a>
  ) : (
    <button className={classes} type={type} aria-label={label} {...rest}>
      {children}
    </button>
  );
}
