import type { FieldsetHTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes.ts";

interface ChipGroupProps {
  /** One row that scrolls sideways when the chips do not fit, as the Library's Show chips do. */
  scroll?: boolean;
  /**
   * For placing the group where it stands (a card-group, a scroll fade), or a hook a page's rule or
   * script finds it by. An Astro page passes className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** Astro places the group in its parent's slot with it; it is not an attribute of the fieldset. */
  slot?: string;
  /** The Chips. */
  children: ReactNode;
}

type Props = ChipGroupProps &
  Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, keyof ChipGroupProps>;

/**
 * A row of Chips (D237): a native fieldset that wraps them, 8px apart, or one row that scrolls
 * sideways. Name it with aria-label or aria-labelledby; `disabled` turns off every chip in it, as a
 * fieldset does. Static: no script and no client directive.
 */
export default function ChipGroup({
  scroll = false,
  className,
  slot: _slot,
  children,
  ...passed
}: Props) {
  const classes = ["filter-chips", scroll && "filter-chips-scroll", className]
    .filter(Boolean)
    .join(" ");
  return (
    <fieldset className={classes} {...passedAttributes(passed)}>
      {children}
    </fieldset>
  );
}
