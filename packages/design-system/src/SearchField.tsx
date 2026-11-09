import type { InputHTMLAttributes } from "react";
import { passedAttributes } from "./attributes.ts";
import Icon from "./Icon.tsx";
import "../styles/search-field.css";

interface SearchFieldProps {
  /** The input's name for a screen reader ("Search your library"); the glyph and the hint show it. */
  label: string;
  /**
   * For placing the field where it stands, or a hook a page's rule finds it by. Never its look. It
   * goes on the pill (the label); every other attribute goes on its input. An Astro page passes
   * className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** Astro places the field in its parent's slot with it; it is not an attribute of the input. */
  slot?: string;
}

type Props = SearchFieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, keyof SearchFieldProps>;

/**
 * The Search field (D243, DS-8): a native search input in a filled pill with the search glyph,
 * React-rendered with no client directive, so it types, submits and filters by a page's script
 * before any React. No Base UI: alone, Base UI's Field control adds nothing a native input lacks.
 * An Astro page starts it with defaultValue; a React island controls it with value and onChange.
 */
export default function SearchField({
  label,
  className,
  type = "search",
  slot: _slot,
  ...passed
}: Props) {
  return (
    <label className={["search-field", className].filter(Boolean).join(" ")}>
      <Icon name="search" />
      <span className="sr-only">{label}</span>
      <input type={type} {...passedAttributes(passed)} />
    </label>
  );
}
