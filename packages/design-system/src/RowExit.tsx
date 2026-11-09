import type { CSSProperties, LiHTMLAttributes, ReactNode } from "react";
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
 * A style string's declarations: split at each `;` outside quotes and parentheses, so a value that holds
 * one (`url(data:image/png;base64,...)`, `content: ";"`) stays whole.
 */
function declarations(style: string): string[] {
  const out: string[] = [];
  let quote = "";
  let depth = 0;
  let start = 0;
  for (let at = 0; at < style.length; at += 1) {
    const character = style[at];
    if (character === "\\") at += 1;
    else if (quote) quote = character === quote ? "" : quote;
    else if (character === '"' || character === "'") quote = character;
    else if (character === "(") depth += 1;
    else if (character === ")") depth = Math.max(0, depth - 1);
    else if (character === ";" && depth === 0) {
      out.push(style.slice(start, at));
      start = at + 1;
    }
  }
  return [...out, style.slice(start)];
}

/**
 * A `style="order: 1"` string, the form `RowExit.astro` took and still passes on, as the object React
 * requires: React throws on a string style, and the deprecated path keeps its open attributes
 * (COMPATIBILITY.md). A property name holds no colon, so the first one ends it.
 */
function styleObject(style: string): CSSProperties {
  const entries = declarations(style)
    .map((declaration) => declaration.split(/:(.*)/s))
    .filter(([name, value]) => name?.trim() && value?.trim())
    .map(([name = "", value = ""]) => {
      const property = name.trim();
      return [
        property.startsWith("--")
          ? property
          : property
              .replace(/^-ms-/, "ms-")
              .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
        value.trim(),
      ];
    });
  return Object.fromEntries(entries);
}

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
