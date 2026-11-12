import type { InputHTMLAttributes } from "react";
import { passedAttributes } from "./attributes.ts";
import Icon from "./Icon.tsx";
import "../styles/search-field.css";

interface SearchFieldProps {
  /** The input's name for a screen reader ("Search your library"); the glyph and the hint show it. */
  label: string;
  /**
   * A Clear text button at the field's end, shown while it holds text. The page calls
   * installSearchClear() from design-system/searchField once per page load. Experimental (DS-11): it
   * may change or go in a minor release (searchField.ts says why it exists).
   */
  clearable?: boolean;
  /**
   * For placing the field where it stands, or a hook a page's rule finds it by. Never its look. It
   * goes on the outer element (the pill, or the wrapper of a clearable field); every other attribute
   * goes on its input. An Astro page passes className too: @astrojs/react drops a `class` prop.
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
  clearable = false,
  className,
  type = "search",
  slot: _slot,
  ...passed
}: Props) {
  const field = (
    <label className={["search-field", clearable ? "" : className].filter(Boolean).join(" ")}>
      <Icon name="search" />
      <span className="sr-only">{label}</span>
      <input type={type} {...passedAttributes(passed)} />
    </label>
  );
  if (!clearable) return field;
  return (
    <div className={["search-wrap", className].filter(Boolean).join(" ")}>
      {field}
      <button
        className="search-clear press press-subtle"
        type="button"
        aria-label="Clear text"
        hidden
      >
        <Icon name="close" />
      </button>
    </div>
  );
}
