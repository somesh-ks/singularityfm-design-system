import type { ButtonHTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes.ts";
import { type ButtonSize, type ButtonTone, type ButtonVariant, buttonClass } from "./button.ts";

interface ButtonProps {
  /** Filled, tonal or text (button.ts says what each is for). */
  variant: ButtonVariant;
  /** The danger tone, for a text button that confirms a delete. */
  tone?: ButtonTone;
  /** Small: a shorter pill for a dense row or a popover (button.ts says when). */
  size?: ButtonSize;
  /** Draws a link instead of a button, for an action that goes to an address. */
  href?: string;
  target?: string;
  rel?: string;
  /**
   * For placing the button where it stands (a margin, a grid area). Never its look. An Astro page
   * passes className too: @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
  /** Astro places the button in its parent's slot with it; it is not an attribute of the button. */
  slot?: string;
  children?: ReactNode;
}

type Props = ButtonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonProps>;

/**
 * The Button (DS-3): static, so it renders on the server with no client directive and ships no
 * script. No Base UI: a native button or link already has every behaviour it needs.
 */
export default function Button({
  variant,
  tone,
  size,
  href,
  className,
  type = "button",
  slot: _slot,
  children,
  ...passed
}: Props) {
  const rest = passedAttributes(passed);
  const classes = [buttonClass(variant, tone, size), className].filter(Boolean).join(" ");
  return href ? (
    <a className={classes} href={href} {...rest}>
      {children}
    </a>
  ) : (
    <button className={classes} type={type} {...rest}>
      {children}
    </button>
  );
}
