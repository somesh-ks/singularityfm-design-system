import type { CSSProperties, InputHTMLAttributes } from "react";
import { passedAttributes, styleObject } from "./attributes";
import { switchClass } from "./switch";
import "../styles/switch.css";

interface SwitchProps {
  /**
   * For placing the switch where it stands (a margin, a grid area). Never its look. An Astro page
   * passes className too: @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
  /** Inline style, as an object or the string an Astro page writes; never its look. */
  style?: CSSProperties | string;
}

type Props = SwitchProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof SwitchProps | "type" | "role">;

/**
 * The Switch (DS-8): the native checkbox with `role="switch"`, so it flips, submits and is named by a
 * `<label for>` before any script, and takes no client directive. An Astro page starts it with
 * defaultChecked; a React island passes checked with onChange. A master over a group is mixed while
 * the script sets the checkbox's `indeterminate`, a property with no attribute.
 */
export default function Switch({ className, style, ...passed }: Props) {
  return (
    <input
      {...passedAttributes(passed)}
      className={[switchClass(), className].filter(Boolean).join(" ")}
      style={typeof style === "string" ? styleObject(style) : style}
      type="checkbox"
      // biome-ignore lint/a11y/useAriaPropsForRole: a checkbox's own checked state is its aria-checked (ARIA in HTML); one written here would freeze while a press flips the box with no script.
      role="switch"
    />
  );
}
