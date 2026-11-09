import { Button as BaseButton } from "@base-ui/react/button";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes";
import { type ButtonSize, type ButtonTone, type ButtonVariant, buttonClass } from "./button";

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
 * The Button (DS-4, DS-7) on Base UI's Button: a native `<button>` (data-disabled when disabled), so it
 * presses, submits and stays disabled before any script and takes no client directive. An Astro page
 * draws it as it is and ships no script for it; in a React island it hydrates with the island. With an
 * href it is a plain `<a>`: a link is never a Base UI primitive (DS-4).
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
    <BaseButton className={classes} type={type} {...rest}>
      {children}
    </BaseButton>
  );
}
