interface Props {
  /**
   * For placing the bars where they stand, or a hook a page's rule finds them by (the reader's cover
   * button sizes them to its glyph). Never their look. An Astro page passes className too:
   * @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** Astro places the bars in its parent's slot with it; it is not an attribute of the element. */
  slot?: string;
}

/**
 * The three moving bars that stand for "playing" (D237): the Play chip's mark while its item plays,
 * and the mark of any other play control that shows the same state, so no page types their class.
 * Static, with no script: buttons.css moves them, and holds them at three heights under reduced
 * motion. Hidden from a screen reader: the control that holds them names what plays.
 */
export default function PlayingBars({ className, slot: _slot }: Props) {
  return (
    <span className={["chip-bars", className].filter(Boolean).join(" ")} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
