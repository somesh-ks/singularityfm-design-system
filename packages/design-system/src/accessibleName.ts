/**
 * A development warning for a control the library draws with nothing to name it. A screen reader
 * announces an unnamed radio group, select or slider by its role alone ("slider"), and nothing in the
 * types catches it: an outside `<label for>` is a valid name the component cannot see, so a required
 * prop would break correct callers (owner, 2026-11-10: a warning now, not a major).
 */

/** The attributes that can name a control, as a component receives them. */
interface Naming {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  title?: string;
  id?: string;
}

const warned = new Set<string>();

/**
 * Node's `process`, declared here so a consumer's tsc reads the shipped source without Node's types.
 * Only a type: nothing is emitted, so a bundle still sees the plain `process.env.NODE_ENV`.
 */
declare const process: { env: Record<string, string | undefined> };

/**
 * The environment's mode, written as the literal `process.env.NODE_ENV` that Vite, webpack and
 * esbuild replace in a browser bundle, so a client-drawn control warns in development too. Only
 * "development" warns; a browser bundle that replaces nothing has no `process` and stays quiet.
 */
function developing(): boolean {
  try {
    return process.env.NODE_ENV === "development";
  } catch {
    return false;
  }
}

/**
 * Warns once per component when it has no name. An `id` counts as one when `byId` is set (a select
 * or a slider an outside `<label for>` names); a fieldset cannot take one that way. A component with a
 * `label` prop passes `label`, even when it is undefined, so the advice names the prop only where it
 * exists. A `<label>` wrapped around the control names it too, but a server render cannot see its
 * parent, so the advice points such a caller at `for` and an id.
 */
export function warnUnnamed(
  component: string,
  naming: Naming,
  options: { byId?: boolean; label?: unknown } = {},
): void {
  if (!developing() || warned.has(component)) return;
  const { byId = false, label } = options;
  const named =
    (typeof label === "string" ? Boolean(label.trim()) : Boolean(label)) ||
    Boolean(naming["aria-label"]?.trim()) ||
    Boolean(naming["aria-labelledby"]?.trim()) ||
    Boolean(naming.title?.trim()) ||
    (byId && Boolean(naming.id));
  if (named) return;
  warned.add(component);
  const ways = [
    ...("label" in options ? ["label"] : []),
    "aria-label",
    "aria-labelledby",
    ...(byId ? ["an id an outside <label for> names (a wrapping <label> it cannot see)"] : []),
  ];
  console.warn(
    `@singularityfm/design-system: a ${component} has no accessible name, so a screen reader says only its role. Pass ${ways.slice(0, -1).join(", ")} or ${ways.at(-1)}.`,
  );
}
