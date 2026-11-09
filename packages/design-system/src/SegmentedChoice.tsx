import type { FieldsetHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes";

export type SegmentedChoiceOption = {
  value: string;
  /** The segment's words. */
  label: ReactNode;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "name" | "value" | "checked" | "defaultChecked" | "onChange"
>;

interface SegmentedChoiceProps {
  /** The radios' name, which a form posts with the chosen value. */
  name: string;
  /** Two to four segments; any other attribute of one (data-*, disabled) goes on its radio. */
  options: readonly SegmentedChoiceOption[];
  /** The value chosen when it is first drawn; the radios then keep their own. An Astro page's. */
  defaultValue?: string;
  /** The chosen value, as the state of a React island: pair it with onValueChange. */
  value?: string;
  onValueChange?: (value: string) => void;
  /**
   * For placing it where it stands, or a hook a page's rule finds it by. Never its look. An Astro
   * page passes className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** Astro places it in its parent's slot with it; it is not an attribute of the fieldset. */
  slot?: string;
}

type Props = SegmentedChoiceProps &
  Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, keyof SegmentedChoiceProps | "role">;

/**
 * The Segmented choice (D132, D243, DS-8): native radios in a fieldset with the radiogroup role,
 * React-rendered with no client directive. Each radio is its segment's whole face and invisible
 * (primitives.css), so the choice takes a press, the arrow keys and a form's post before any
 * script, and a page's script reads and sets it as any radio. Name it with aria-labelledby or
 * aria-label; `disabled` turns off every segment, as a fieldset does.
 */
export default function SegmentedChoice({
  name,
  options,
  defaultValue,
  value,
  onValueChange,
  className,
  slot: _slot,
  ...passed
}: Props) {
  return (
    <fieldset
      className={["segmented-choice", className].filter(Boolean).join(" ")}
      // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: the fieldset groups and names the radios for a form; radiogroup is the role the markup and its rules hold (D132, primitives.css).
      role="radiogroup"
      {...passedAttributes(passed)}
    >
      {options.map(({ value: option, label, ...attributes }) => (
        <label className="segmented-choice-item" key={option}>
          <input
            type="radio"
            name={name}
            value={option}
            {...passedAttributes(attributes)}
            {...(value === undefined
              ? { defaultChecked: option === defaultValue }
              : { checked: option === value, onChange: () => onValueChange?.(option) })}
          />
          <span>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
