import type { CSSProperties, ReactNode, SelectHTMLAttributes } from "react";
import { warnUnnamed } from "./accessibleName.ts";
import { passedAttributes, styleObject } from "./attributes.ts";
import { fieldClass } from "./field.ts";
import Icon from "./Icon.tsx";
import { type SelectVariant, selectClass } from "./select.ts";
import "../styles/field.css";
import "../styles/select.css";
import "../styles/wheel.css";

interface SelectProps {
  /** Outlined for a value in a form, tonal for a sort or a filter (select.ts says which is which). */
  variant?: SelectVariant;
  /** A name for a select that has no label of its own; read aloud, never drawn. Draws a label around it. */
  label?: string;
  /**
   * For placing the select where it stands (a width, a margin). Never its look. An Astro page passes
   * className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /**
   * A tonal select's longest option text ("Longest first"); an outlined select ignores it. Where the browser draws the closed select
   * as its chosen option (appearance: base-select) it is as wide as that option, so it grows and
   * shrinks as a person picks. With a reserve it is as wide as these words in every state (DS-9).
   */
  reserve?: string;
  /** The options: `<option>` and `<optgroup>`, as a native select holds them. */
  children?: ReactNode;
}

type Props = SelectProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, keyof SelectProps | "style"> & {
    style?: CSSProperties | string;
  };

/**
 * The Select (DS-8): a native select, rendered on the server with no client directive, so it opens,
 * picks and submits before any script, and draws its own list where the browser lets a page style it
 * (appearance: base-select, select.css). On a phone the list is the standard bottom sheet (or a Wheel,
 * data-wheel), which selectSheet.ts opens in its place: a page that draws a Select calls
 * installSelectSheet() once, and until it has, the browser's own list opens.
 */
export default function Select({
  variant = "outlined",
  label,
  reserve,
  className,
  style,
  children,
  ...passed
}: Props) {
  warnUnnamed("Select", passed, { byId: true, label });
  const Wrapper = label ? "label" : "span";
  return (
    <Wrapper
      className={[selectClass(variant), className].filter(Boolean).join(" ")}
      data-select=""
      data-reserve={variant === "tonal" ? reserve : undefined}
    >
      {label && <span className="sr-only">{label}</span>}
      <select
        // An outlined select is a Field's looks inside the wrapper; a tonal one is drawn by the wrapper.
        className={variant === "outlined" ? fieldClass() : undefined}
        style={typeof style === "string" ? styleObject(style) : style}
        {...passedAttributes(passed)}
      >
        {children}
      </select>
      <Icon name="chevronDown" />
    </Wrapper>
  );
}
