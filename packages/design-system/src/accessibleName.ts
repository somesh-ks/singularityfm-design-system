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
 * The environment's mode, read without Node's types (the package ships its source, which a consumer's
 * tsc reads). Only "development" warns, so a browser bundle, where there is no `process`, stays quiet.
 */
function developing(): boolean {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env;
  return env?.NODE_ENV === "development";
}

/**
 * Warns once per component when it has no name. An `id` counts as one when `byId` is set (a select
 * or a slider an outside `<label for>` names); a fieldset cannot take one that way.
 */
export function warnUnnamed(
  component: string,
  naming: Naming,
  { byId = false, label }: { byId?: boolean; label?: unknown } = {},
): void {
  if (!developing() || warned.has(component)) return;
  const named =
    Boolean(label) ||
    Boolean(naming["aria-label"]?.trim()) ||
    Boolean(naming["aria-labelledby"]?.trim()) ||
    Boolean(naming.title?.trim()) ||
    (byId && Boolean(naming.id));
  if (named) return;
  warned.add(component);
  console.warn(
    `@singularityfm/design-system: a ${component} has no accessible name, so a screen reader says only its role. Pass ${
      byId
        ? "label, aria-label, aria-labelledby, or an id an outside <label for> names"
        : "aria-label or aria-labelledby"
    }.`,
  );
}
