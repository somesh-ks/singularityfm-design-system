import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { type ComponentProps, useState } from "react";
import { passedAttributes, styleObject } from "./attributes";
import { switchClass } from "./switch";
import "../styles/switch.css";

interface SwitchProps {
  /**
   * On, as the state of a React island: pair it with onCheckedChange. An Astro page passes
   * defaultChecked instead; a page cannot hold the state, so checked there leaves the switch stuck.
   */
  checked?: boolean;
  /** On when it is first drawn; it then keeps its own state. */
  defaultChecked?: boolean;
  /**
   * Mixed: a master over a group of which only some are on. It draws between off and on, unchecked,
   * until it is pressed, as a checkbox's indeterminate does; a new value sets it again.
   */
  indeterminate?: boolean;
  /**
   * For placing the switch where it stands (a margin, a grid area). Never its look. An Astro page
   * passes className too: @astrojs/react drops a `class` prop before the component sees it.
   */
  className?: string;
}

type Props = SwitchProps &
  Omit<ComponentProps<typeof BaseSwitch.Root>, keyof SwitchProps | "render" | "nativeButton">;

/**
 * The Switch (DS-4, DS-7) on Base UI's Switch: a `<button role="switch">` that carries the state as
 * data-checked or data-unchecked, and a hidden checkbox beside it that carries `name` and the value
 * to a form. It renders its whole look on the server; it answers a press once it hydrates, so an
 * Astro page draws it with `client:load` and a React island draws it as it is. `id` names the
 * button, so a `<label for>` names and presses it.
 */
export default function Switch({
  className,
  indeterminate = false,
  onCheckedChange,
  style,
  ...passed
}: Props) {
  // A checkbox's indeterminate clears on its first press; the prop is the script's `indeterminate = true`.
  const [mixed, setMixed] = useState(indeterminate);
  const [given, setGiven] = useState(indeterminate);
  if (given !== indeterminate) {
    setGiven(indeterminate);
    setMixed(indeterminate);
  }
  return (
    <BaseSwitch.Root
      {...passedAttributes(passed)}
      className={[switchClass(), className].filter(Boolean).join(" ")}
      style={typeof style === "string" ? styleObject(style) : style}
      nativeButton
      render={<button type="button" />}
      data-indeterminate={mixed ? "" : undefined}
      onCheckedChange={(checked, details) => {
        setMixed(false);
        onCheckedChange?.(checked, details);
      }}
    />
  );
}
