import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { passedAttributes, styleObject } from "./attributes.ts";
import { dialogBodyClass, dialogClass } from "./dialog.ts";
import "../styles/dialog.css";

interface DialogProps {
  /**
   * Attributes for a form body: the dialog then submits. Without it the body is a plain box. An Astro
   * page writes them as HTML does (`novalidate`, `method: "dialog"`).
   */
  form?: Record<string, unknown>;
  /**
   * For placing the dialog where it stands. Never its look. An Astro page passes className too:
   * @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
  /** The question, its words and its DialogActions, inside the body. */
  children?: ReactNode;
  /** What sits after the body, outside the form: a hidden part a script reads (data-copy). */
  after?: ReactNode;
}

type Props = DialogProps &
  Omit<ComponentProps<"dialog">, keyof DialogProps | "open" | "style"> & {
    /** A string, as the deprecated .astro path takes it, or the object React does. */
    style?: CSSProperties | string;
  };

/**
 * The Dialog (DS-3): a native modal `<dialog>`, drawn closed on the server with no client directive
 * and no script of its own. The platform does what a modal must: the top layer, the inert page,
 * Escape, focus moved in and given back, and `method="dialog"` closing it from a form. A page's
 * script opens it with showModal() and finds it by DIALOG_SELECTOR; a React island passes `ref` and
 * does the same.
 */
export default function Dialog({ form, className, children, after, style, ...passed }: Props) {
  const body = { className: dialogBodyClass(), children };
  return (
    <dialog
      className={[dialogClass(), className].filter(Boolean).join(" ")}
      data-dialog=""
      {...passedAttributes(passed)}
      style={typeof style === "string" ? styleObject(style) : style}
    >
      {form ? (
        // passedAttributes names `novalidate` noValidate: React drops the lowercase boolean.
        <form {...body} {...passedAttributes(form)} />
      ) : (
        <div {...body} />
      )}
      {after}
    </dialog>
  );
}
