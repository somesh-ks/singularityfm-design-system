/** A component's name; `Name.part` points at one of its variants or tones, e.g. `Button.text`. */
export type ComponentName =
  | "Button"
  | "Icon"
  | "Icon button"
  | "FAB"
  | "Chip"
  | "Play chip"
  | "Segmented choice"
  | "Segmented navigation"
  | "Search field"
  | "Code"
  | "Glow"
  | "Link"
  | "Switch"
  | "Slider"
  | "Field"
  | "Select"
  | "Menu"
  | "Badge"
  | "Flag"
  | "Banner"
  | "Toast"
  | "Dialog"
  | "Sheet"
  | "Drawer"
  | "Wheel"
  | "Ripple";
export type ComponentRef = ComponentName | `${ComponentName}.${string}`;

export interface DontUse {
  /** The situation that looks like a fit and is not. */
  when: string;
  /** What to use there; absent when the answer is to change the design, not the component. */
  instead?: ComponentRef;
}

/**
 * What a design-system component, variant or tone says about itself, so that a person or an agent
 * can pick the right one without reading the stylesheet. Every one says when to use it and, naming
 * the alternative, when not to; designSystem.test.ts holds each to that.
 */
export interface Guidance {
  /** One line: what it is. */
  summary: string;
  /** Situations it is for. */
  useWhen: readonly string[];
  /** Situations that look like it and are not, each pointing at what to use instead. */
  dontUseWhen: readonly DontUse[];
  /** Its options that are experimental (DS-11); every other option is stable. */
  experimental?: readonly Experimental[];
}

/**
 * An option kept for one screen's strong case (DS-11): an owner's call with its date, or a constraint
 * no stable option meets. It ships beside the stable options, may change or go in a minor release, and
 * is promoted (two screens or more, unchanged for four weeks, the owner agrees) or folded away after
 * eight weeks on one screen. `ds find` and tokens/system.json list it; an app's usage report counts
 * it by its hook.
 */
export interface Experimental {
  /** The option as an author writes it: a prop, a variant or a custom property. */
  option: string;
  /** What the drawn element carries, which a usage report can count: a class, an attribute or a property. */
  hook: string;
  /** The strong case: the owner's call with its date, or the limit no stable option meets. */
  reason: string;
  /** The day it shipped as experimental, YYYY-MM-DD. */
  since: string;
}
