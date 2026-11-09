import { Field as BaseField } from "@base-ui/react/field";
import type { CSSProperties, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { passedAttributes, styleObject } from "./attributes";
import { fieldClass } from "./field";
import "../styles/field.css";

interface FieldProps {
  /** Several lines that grow with the text; the corner arc is a pill's, shortened. */
  multiline?: boolean;
  /** How many lines a multiline field grows to before it scrolls inside; 6 when left out. */
  maxLines?: number;
  /**
   * For placing the field where it stands (a width, a margin). Never its look. An Astro page passes
   * className too: @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
}

type Props = FieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof FieldProps | "style"> &
  Pick<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows" | "cols" | "wrap"> & {
    style?: CSSProperties | string;
  };

/**
 * The Field (DS-8) on Base UI's Field control: a native input, or a textarea when multiline,
 * so it types, submits and validates before any script and needs no client directive. Inside Base
 * UI's Field.Root (a React island's form) it takes that field's label, description and validity;
 * alone it is the plain control, and `aria-invalid` draws the failed edge.
 */
export default function Field({
  multiline = false,
  maxLines,
  className,
  rows,
  cols,
  wrap,
  style,
  ...passed
}: Props) {
  const lines = multiline && maxLines ? { "--field-max-lines": maxLines } : undefined;
  return (
    <BaseField.Control
      {...passedAttributes(passed)}
      className={[fieldClass(), className].filter(Boolean).join(" ")}
      style={{ ...lines, ...(typeof style === "string" ? styleObject(style) : style) }}
      render={multiline ? <textarea rows={rows} cols={cols} wrap={wrap} /> : undefined}
    />
  );
}
