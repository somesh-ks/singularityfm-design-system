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

/**
 * The motion in flight: one for the whole column, so presses on two groups never fight. Each press adds
 * a layer and leaves the earlier ones running (composite "add"), so a row already moving keeps its speed
 * through a second press and only takes on that press's own push, as a single press would give it.
 */
let flight: Animation[] = [];
/** Per press, so only the newest press's end settles the column. */
let press = 0;
/** Where each row and each group's visible height end up, as the last press laid them out. */
const tops = new Map<HTMLElement, number>();
const heights = new Map<Group, number>();
/** Each list's fade, the one part that replaces rather than adds: opacity clamps a layer to 0 to 1. */
const fades = new Map<Group, Animation>();

const expanded = ({ toggle }: Group): boolean => toggle.getAttribute("aria-expanded") === "true";

/** A motion token, read from the stylesheet so the script and the CSS keep one timing. */
function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Drops what a motion held inline. Touching the style of an element with none writes `style=""`. */
function unhold(element: HTMLElement): void {
  if (!element.hasAttribute("style")) return;
  element.style.removeProperty("translate");
  element.style.removeProperty("clip-path");
  if (!element.style.length) element.removeAttribute("style");
}

/** Ends any motion and puts every list where its chevron says. */
function settle(): void {
  for (const animation of flight) animation.cancel();
  flight = [];
  tops.clear();
  heights.clear();
  fades.clear();
  for (const entry of groups) entry.panel.hidden = !expanded(entry);
  for (const row of document.querySelectorAll<HTMLElement>(".app-nav-list > li, .guide-nav-foot")) {
    unhold(row);
  }
}

/**
 * Moves the column to what the chevrons now say. It lays the column out with every list that is open
 * or still leaving and reads where everything ends; that is the only layout. A row's inline translate
 * holds it at its end and a layer of transform animates the difference away; a group's inline clip
 * holds its box at its end height and a layer of clip-path does the same (so its tonal fill grows with
 * it); a list fades. Only transform, translate, clip-path and opacity change, so no frame lays out again.
 * A list that closes stays in the page until the motion ends.
 */
function move(nav: HTMLElement, open: boolean): void {
  const rows = [...nav.querySelectorAll<HTMLElement>(".app-nav-list > li, .guide-nav-foot")];
  // Where the last press sent everything, or where it stands at rest. offsetTop and offsetHeight
  // ignore transforms and clips, so the column must be at rest for them to be what is seen.
  const wasTop = new Map(rows.map((row) => [row, tops.get(row) ?? row.offsetTop]));
  const wasHeight = new Map(
    groups.map((entry) => [entry, heights.get(entry) ?? entry.group.offsetHeight]),
  );
  const faded = new Map(
    groups.map((entry) => [
      entry,
      entry.panel.hidden ? 0 : Number.parseFloat(getComputedStyle(entry.panel).opacity),
    ]),
  );
  const leaving = new Set(groups.filter((entry) => !entry.panel.hidden));

  const scroll = nav.scrollTop;
  const layOut = (final: boolean): void => {
    for (const entry of groups) {
      entry.panel.hidden = !(expanded(entry) || (!final && leaving.has(entry)));
    }
  };
  layOut(true);
  for (const row of rows) tops.set(row, row.offsetTop);
  for (const entry of groups) heights.set(entry, entry.group.offsetHeight);
  layOut(false);
  // Every read of the layout in flight before the first write, so the press lays out once.
  const placed = new Map(rows.map((row) => [row, row.offsetTop]));
  const boxed = new Map(
    groups.map((entry) => [
      entry,
      {
        height: entry.group.offsetHeight,
        radius: getComputedStyle(entry.group).borderTopLeftRadius,
      },
    ]),
  );
  // shortcut: hiding a list can clamp the column's scroll; it is put back here, but a close that ends
  // at the column's end still settles by the clamp. Upgrade if a short window makes it show.
  nav.scrollTop = scroll;

  const timing: KeyframeAnimationOptions = {
    duration: Number.parseFloat(token(open ? "--duration-enter" : "--duration-state")),
    easing: token("--ease-out"),
    fill: "forwards",
    composite: "add",
  };
  for (const row of rows) {
    const at = placed.get(row) ?? 0;
    const end = tops.get(row) ?? at;
    row.style.translate = `0 ${end - at}px`;
    const push = (wasTop.get(row) ?? end) - end;
    if (Math.abs(push) < 0.5) continue;
    flight.push(row.animate({ transform: [`translateY(${push}px)`, "translateY(0)"] }, timing));
  }
  for (const entry of groups) {
    const { height, radius } = boxed.get(entry) ?? { height: 0, radius: "0" };
    const end = heights.get(entry) ?? height;
    entry.group.style.clipPath = `inset(0 0 ${height - end}px 0 round ${radius})`;
    const push = end - (wasHeight.get(entry) ?? end);
    if (Math.abs(push) >= 0.5) {
      flight.push(
        entry.group.animate({ clipPath: [`inset(0 0 ${push}px 0)`, "inset(0 0 0 0)"] }, timing),
      );
    }
    const fade = expanded(entry) ? 1 : 0;
    if (!entry.panel.hidden && faded.get(entry) !== fade) {
      // A cancelled fade's finished promise is replaced by one that never settles, so it leaves the flight.
      const replaced = fades.get(entry);
      replaced?.cancel();
      flight = flight.filter((animation) => animation !== replaced);
      const fading = entry.panel.animate(
        { opacity: [String(faded.get(entry)), String(fade)] },
        { ...timing, composite: "replace" },
      );
      fades.set(entry, fading);
      flight.push(fading);
    }
  }
  const mine = ++press;
  const done = (): void => {
    if (mine === press) settle();
  };
  if (!flight.length) done();
  // settle() cancels the flight, which rejects these promises; it has ended all the same.
  else Promise.all(flight.map((animation) => animation.finished.catch(() => {}))).then(done);
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
