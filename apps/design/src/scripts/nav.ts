/** The side column's accordion: a chevron opens and closes a page's pages; and which link is current. */
export {};

const wide = matchMedia("(width >= 64rem)");
const still = matchMedia("(prefers-reduced-motion: reduce)");

interface Group {
  group: HTMLElement;
  toggle: HTMLButtonElement;
  panel: HTMLElement;
}

const groups: Group[] = [];
for (const toggle of document.querySelectorAll<HTMLButtonElement>("[data-nav-toggle]")) {
  const group = toggle.closest<HTMLElement>(".guide-nav-group");
  const panel = document.getElementById(toggle.getAttribute("aria-controls") ?? "");
  if (group && panel) groups.push({ group, toggle, panel });
}

/** The motion in flight: one for the whole column, so presses on two groups never fight. */
let flight: Animation[] = [];

const expanded = ({ toggle }: Group): boolean => toggle.getAttribute("aria-expanded") === "true";

/** A motion token, read from the stylesheet so the script and the CSS keep one timing. */
function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** How far an element is moved now, by a motion in flight. */
function lift(element: HTMLElement): number {
  return new DOMMatrixReadOnly(getComputedStyle(element).transform).m42;
}

/** How much of a group's box its clip hides now, from the bottom. */
function cut(element: HTMLElement): number {
  const inset = /inset\(([^)]*)\)/.exec(getComputedStyle(element).clipPath)?.[1];
  if (!inset) return 0;
  const sides = (inset.split(" round ")[0] ?? "").trim().split(/\s+/).map(Number.parseFloat);
  return sides[2] ?? sides[0] ?? 0;
}

/** Ends any motion and puts every list where its chevron says. */
function settle(): void {
  for (const animation of flight) animation.cancel();
  flight = [];
  for (const entry of groups) entry.panel.hidden = !expanded(entry);
}

/**
 * Moves the column to what the chevrons now say. It reads where everything stands on screen (a motion
 * in flight included), lays the column out with every list that is open or still leaving, and reads
 * where everything ends; that is the only layout. After it only transform (the rows), opacity (a
 * group's pages) and clip-path (a group's box, so its tonal fill grows with it) change, so no frame lays
 * out again. A list that closes stays in the page until the motion ends. A press mid-flight, on this
 * group or another, starts every part from where it stands.
 */
function move(nav: HTMLElement, open: boolean): void {
  const rows = [...nav.querySelectorAll<HTMLElement>(".app-nav-list > li, .guide-nav-foot")];
  // Where things stand on screen. offsetTop and offsetHeight ignore transforms and clips.
  const seen = new Map(rows.map((row) => [row, row.offsetTop + lift(row)]));
  const shown = new Map(
    groups.map((entry) => [entry, entry.group.offsetHeight - cut(entry.group)]),
  );
  const faded = new Map(
    groups.map((entry) => [
      entry,
      entry.panel.hidden ? 0 : Number.parseFloat(getComputedStyle(entry.panel).opacity),
    ]),
  );
  const leaving = new Set(groups.filter((entry) => !entry.panel.hidden));
  for (const animation of flight) animation.cancel();
  flight = [];

  const scroll = nav.scrollTop;
  const layOut = (final: boolean): void => {
    for (const entry of groups) {
      entry.panel.hidden = !(expanded(entry) || (!final && leaving.has(entry)));
    }
  };
  layOut(true);
  const endTops = new Map(rows.map((row) => [row, row.offsetTop]));
  const endHeights = new Map(groups.map((entry) => [entry, entry.group.offsetHeight]));
  layOut(false);
  // shortcut: hiding a list can clamp the column's scroll; it is put back here, but a close that ends
  // at the column's end still settles by the clamp. Upgrade if a short window makes it show.
  nav.scrollTop = scroll;

  const timing: KeyframeAnimationOptions = {
    duration: Number.parseFloat(token(open ? "--duration-enter" : "--duration-state")),
    easing: token("--ease-out"),
    fill: "forwards",
  };
  for (const row of rows) {
    const from = (seen.get(row) ?? 0) - row.offsetTop;
    const to = (endTops.get(row) ?? 0) - row.offsetTop;
    if (Math.abs(from) < 0.5 && Math.abs(to) < 0.5) continue;
    flight.push(
      row.animate({ transform: [`translateY(${from}px)`, `translateY(${to}px)`] }, timing),
    );
  }
  for (const entry of groups) {
    const height = entry.group.offsetHeight;
    const from = height - (shown.get(entry) ?? height);
    const to = height - (endHeights.get(entry) ?? height);
    if (Math.abs(from) >= 0.5 || Math.abs(to) >= 0.5) {
      const radius = getComputedStyle(entry.group).borderTopLeftRadius;
      const clip = (hidden: number): string => `inset(0 0 ${hidden}px 0 round ${radius})`;
      flight.push(entry.group.animate({ clipPath: [clip(from), clip(to)] }, timing));
    }
    const fade = expanded(entry) ? 1 : 0;
    if (!entry.panel.hidden && faded.get(entry) !== fade) {
      flight.push(
        entry.panel.animate({ opacity: [String(faded.get(entry)), String(fade)] }, timing),
      );
    }
  }
  const current = flight;
  if (!current.length) settle();
  else current[0]?.addEventListener("finish", () => current === flight && settle());
}

for (const entry of groups) {
  entry.toggle.addEventListener("click", () => {
    const open = !expanded(entry);
    entry.toggle.setAttribute("aria-expanded", String(open));
    const nav = entry.group.closest<HTMLElement>(".app-nav");
    // The bottom bar draws no list, and reduced motion opens it at once.
    if (nav && wide.matches && !still.matches) move(nav, open);
    else settle();
  });
}

// The bottom bar has no room for a page's children, so there the group is the destination. In the side
// column the child is, and the group steps back, so a screen reader hears one current page.
function syncCurrent(): void {
  for (const group of document.querySelectorAll<HTMLElement>("[data-group-current]")) {
    if (wide.matches) group.removeAttribute("aria-current");
    else group.setAttribute("aria-current", "page");
  }
}
wide.addEventListener("change", () => {
  settle();
  syncCurrent();
});
syncCurrent();
