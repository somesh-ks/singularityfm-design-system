import type { HTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes.ts";
import { dialogTitleClass } from "./dialog.ts";
import "../styles/dialog.css";

type Props = Omit<HTMLAttributes<HTMLHeadingElement>, "className" | "children"> & {
  /** The question. */
  children?: ReactNode;
};

/**
 * The Dialog's one heading (DS-3): static, so it renders on the server with no client directive and
 * ships no script. Its `id` is what the dialog's aria-labelledby names; its data attributes are a
 * script's (data-confirm-title, whose words a script sets).
 */
export default function DialogTitle({ children, ...passed }: Props) {
  return (
    <h2 className={dialogTitleClass()} {...passedAttributes(passed)}>
      {children}
    </h2>
  );
}
