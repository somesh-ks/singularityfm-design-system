import type { LiHTMLAttributes, ReactNode } from "react";
import { styleObject } from "./attributes.ts";
import { rowExitClass } from "./rowExit.ts";
import "../styles/row-exit.css";

interface RowExitProps {
  /**
   * For placing the row (its own layout). Never how it leaves. An Astro page passes className too:
   * @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
  /** The row's content. */
  children?: ReactNode;
}

type Props = RowExitProps & Omit<LiHTMLAttributes<HTMLLIElement>, keyof RowExitProps>;

/**
 * The Row exit (DS-3): static, so it renders on the server with no client directive and ships no
 * script. Its other attributes (the row's data-*) go on the <li>; a script marks it to take it out.
 */
export default function RowExit({ className = "", children, ...rest }: Props) {
  const attributes = Object.fromEntries(
    Object.entries(rest).map(([name, value]) => [
      name,
      name === "style" && typeof value === "string" ? styleObject(value) : value,
    ]),
  );
  return (
    <li className={[className, rowExitClass()].filter(Boolean).join(" ")} {...attributes}>
      {children}
    </li>
  );
}
