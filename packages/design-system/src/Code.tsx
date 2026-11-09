import { useEffect, useRef, useState } from "react";
import { COPIED_MS, copySnippetText } from "./code";
import Icon from "./Icon";
import IconButton from "./IconButton";
import "../styles/code.css";

interface Props {
  /** The text, copied exactly as it is. */
  text: string;
  /** The text's accessible name, e.g. "Prompt". */
  label: string;
  copy?: string;
  copied?: string;
  /**
   * For placing the snippet where it stands (a margin, a grid area). Never its look. An Astro page
   * passes className too: @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
}

/**
 * The Code snippet (DS-4, DS-7): the text, and a Copy button, the Icon button (DS-8: a native button). It
 * renders its whole look on the server; the button copies once it hydrates, so an Astro page draws
 * it with client:load and a React island draws it as it is. It copies the text the page shows when
 * pressed, so a page script that rewrites `.code-snippet-text` (the style guide's) copies its own.
 */
export default function Code({ text, label, copy = "Copy", copied = "Copied", className }: Props) {
  const textRef = useRef<HTMLPreElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [done, setDone] = useState(false);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onCopy = async () => {
    if (!textRef.current || !(await copySnippetText(textRef.current))) return;
    setDone(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), COPIED_MS);
  };
  return (
    <div
      className={["code-snippet", className].filter(Boolean).join(" ")}
      data-copied={done ? "" : undefined}
    >
      {/* A page script may write the text before hydration: React keeps it rather than redraw it. */}
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: the text is a focusable region a keyboard scrolls and selects, named for a screen reader as the Astro snippet's was. */}
      <pre
        ref={textRef}
        className="code-snippet-text"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a keyboard reaches the text to select it and to scroll it.
        tabIndex={0}
        aria-label={label}
        suppressHydrationWarning
      >
        {text}
      </pre>
      <IconButton label={copy} title={copy} className="code-snippet-copy" onClick={onCopy}>
        <Icon name="copy" size="lg" />
        <Icon name="check" size="lg" />
      </IconButton>
      <span className="sr-only" role="status">
        {done ? copied : ""}
      </span>
    </div>
  );
}
