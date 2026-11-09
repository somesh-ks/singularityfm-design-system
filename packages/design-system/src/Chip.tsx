import type { InputHTMLAttributes, ReactNode } from "react";
import { passedAttributes } from "./attributes";
import Icon from "./Icon.tsx";

interface ChipProps {
  /** The words on the chip: the choice's name. */
  children: ReactNode;
  /**
   * For placing the chip where it stands, or a hook a page's rule finds it by. Never its look. It
   * goes on the chip (the label); every other attribute goes on its checkbox. An Astro page passes
   * className too: @astrojs/react drops a `class` prop.
   */
  className?: string;
  /** Astro places the chip in its parent's slot with it; it is not an attribute of the checkbox. */
  slot?: string;
}

type Props = ChipProps & Omit<InputHTMLAttributes<HTMLInputElement>, keyof ChipProps | "type">;

/**
 * The filter chip (D237, DS-8): a native checkbox drawn as a pill, React-rendered with no client
 * directive. The checkbox is the chip's whole face and invisible (primitives.css), so it ticks by a
 * press, a click on its words and Space, and posts `name` and `value` with its form, before any
 * script; a page's script reads and sets it as any checkbox. An Astro page starts it ticked with
 * defaultChecked; a React island controls it with checked and onChange. Draw chips in a ChipGroup.
 */
export default function Chip({ children, className, slot: _slot, ...passed }: Props) {
  return (
    <label className={["filter-chip", className].filter(Boolean).join(" ")}>
      <input type="checkbox" {...passedAttributes(passed)} />
      <Icon name="check" className="filter-chip-check" />
      <span>{children}</span>
    </label>
  );
}
