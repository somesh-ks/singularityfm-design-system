interface Props {
  /**
   * Its class: wordmark-mark sizes it beside the app's name. An Astro page passes className too:
   * @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
}

/**
 * The BrandMark (DS-3), static: a ringed dot, a point inside a circle, the same figure as the play
 * chip's ringed glyph. The paths are the ones scripts/buildIcons.ts draws into the app icon. The
 * spaces between its shapes are the ones the Astro mark printed, so the page's markup did not change.
 */
export default function BrandMark({ className = "wordmark-mark" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      {" "}
      <path
        fillRule="evenodd"
        d="M12 1.25a10.75 10.75 0 1 0 0 21.5 10.75 10.75 0 0 0 0-21.5Zm0 2.5a8.25 8.25 0 1 1 0 16.5 8.25 8.25 0 0 1 0-16.5Z"
      />{" "}
      <circle cx="12" cy="12" r="4.5" />{" "}
    </svg>
  );
}
