import type { ReactNode } from "react";
import { dialogActionsClass } from "./dialog.ts";
import "../styles/dialog.css";

interface Props {
  /** Three answers in a column, the committing one first. */
  stacked?: boolean;
  /** The answers: Buttons, Cancel first in a row. */
  children?: ReactNode;
}

/** The Dialog's row of answers (DS-3): static, so it renders on the server and ships no script. */
export default function DialogActions({ stacked = false, children }: Props) {
  return <div className={dialogActionsClass(stacked)}>{children}</div>;
}
