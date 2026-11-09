import type { ButtonHTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes.ts";
import { FAB_CLASSES } from "./fab.ts";
import Icon from "./Icon.tsx";
import type { IconName } from "./icons.ts";
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
  /**
   * The widest words the button will say beside its glyph ("Resume · 88 min left"), for one whose
   * words change. It is as wide as these in every state (DS-9); longer words end in an ellipsis.
   */
  reserve?: string;
  /** The word the extended button shows beside its glyph ("Add"); it folds away while reading. */
  children: ReactNode;
}

type Props = FabProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof FabProps>;

const [ROOT, WORD] = FAB_CLASSES;

/**
 * The FAB (DS-3): static, so it renders on the server with no client directive and ships no script.
 * The app's own script folds it (data-folded) while scrolling down to read. No Base UI yet: a native
 * button or link has every behaviour it needs (DS-4 moves it onto Base UI on the 1.0.0-next line).
 */
export default function Fab({
  label,
  icon,
  href,
  className,
  type = "button",
  slot: _slot,
  reserve,
  children,
  ...passed
}: Props) {
  const rest = passedAttributes(passed);
  const classes = [ROOT, className].filter(Boolean).join(" ");
  const face = (
    <>
      <Icon name={icon} size="lg" />
      <span className={WORD} aria-hidden="true" data-reserve={reserve}>
        {reserve ? <span>{children}</span> : children}
      </span>
    </>
  );
  return href ? (
    <a className={classes} href={href} aria-label={label} {...rest}>
      {face}
    </a>
  ) : (
    <button className={classes} type={type} aria-label={label} {...rest}>
      {face}
    </button>
  );
}
