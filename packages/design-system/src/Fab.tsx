import { Button as BaseButton } from "@base-ui/react/button";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes";
import { FAB_CLASSES } from "./fab";
import Icon from "./Icon.tsx";
import type { IconName } from "./icons";
import "../styles/fab.css";

interface FabProps {
  /**
   * What a press does, for a screen reader, in full ("Add source to Design"). The word beside the
   * glyph is hidden from it, so this is the button's one name.
   */
  label: string;
  /** The glyph it keeps when it folds. */
  icon: IconName;
  /** Draws a link instead of a button, so the action works before any script (/create). */
  href?: string;
  target?: string;
  rel?: string;
  /**
   * For a hook a page's rule or script finds it by. Never its look or its place: it floats where
   * fab.css puts it. An Astro page passes className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** Astro places the button in its parent's slot with it; it is not an attribute of the button. */
  slot?: string;
  /** The word the extended button shows beside its glyph ("Add"); it folds away while reading. */
  children: ReactNode;
}

type Props = FabProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof FabProps>;

const [ROOT, WORD] = FAB_CLASSES;

/**
 * The FAB (DS-4, DS-7) on Base UI's Button: a native `<button>`, so it presses before any script and
 * takes no client directive; an Astro page ships no script for it. The app's own script folds it
 * (data-folded) while scrolling down to read. With an href it is a plain `<a>`, so the action works
 * before any script (/create): a link is never a Base UI primitive (DS-4).
 */
export default function Fab({
  label,
  icon,
  href,
  className,
  type = "button",
  slot: _slot,
  children,
  ...passed
}: Props) {
  const rest = passedAttributes(passed);
  const classes = [ROOT, className].filter(Boolean).join(" ");
  const face = (
    <>
      <Icon name={icon} size="lg" />
      <span className={WORD} aria-hidden="true">
        {children}
      </span>
    </>
  );
  return href ? (
    <a className={classes} href={href} aria-label={label} {...rest}>
      {face}
    </a>
  ) : (
    <BaseButton className={classes} type={type} aria-label={label} {...rest}>
      {face}
    </BaseButton>
  );
}
