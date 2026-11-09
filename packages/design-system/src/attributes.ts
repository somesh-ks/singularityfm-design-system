/**
 * The attributes a component passes on to its element, as a plain element would print them. A bare
 * data attribute (data-submit) reaches a React component as true and would print as
 * data-submit="true"; on a plain element it is empty. Scripts read both, so the element keeps the
 * empty form.
 */
export const passedAttributes = (passed: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(passed).map(([name, value]) => [
      name,
      value === true && name.startsWith("data-") ? "" : value,
    ]),
  );
