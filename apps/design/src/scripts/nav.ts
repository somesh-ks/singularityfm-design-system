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
/** Per press, so only the newest press's end settles the column; settle() moves it on too, so a press it already ended does nothing when its motion's promise lands. */
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

/** Everything the column scrolls: the brand, each page's row and the foot. */
const ROWS = ".app-nav-brand, .app-nav-list > li, .guide-nav-foot";

/** Drops what a motion held inline. Touching the style of an element with none writes `style=""`. */
function unhold(element: HTMLElement): void {
  if (!element.hasAttribute("style")) return;
  element.style.removeProperty("translate");
  element.style.removeProperty("clip-path");
  if (!element.style.length) element.removeAttribute("style");
}

/** The scroll the script last restored, so the scroll event it raises is not taken for the reader's. */
let restored: number | null = null;

/** Ends any motion and puts every list where its chevron says. */
function settle(): void {
  press++;
  for (const animation of flight) animation.cancel();
  flight = [];
  tops.clear();
  heights.clear();
  fades.clear();
  for (const entry of groups) {
    entry.panel.hidden = !expanded(entry);
    entry.panel.inert = !expanded(entry);
  }
  for (const row of document.querySelectorAll<HTMLElement>(ROWS)) unhold(row);
}

/**
 * Moves the column to what the chevrons now say. It lays the column out twice, as it will end and then
 * with every list that is open or still leaving, and reads both; no frame of the motion lays out. A row's inline translate
 * holds it at its end and a layer of transform animates the difference away; a group's inline clip
 * holds its box at its end height and a layer of clip-path does the same (so its tonal fill grows with
 * it); a list fades. Only transform, translate, clip-path and opacity change, so no frame lays out again.
 * A list that closes stays in the page until the motion ends.
 */
function move(nav: HTMLElement, pressed: Group, open: boolean): void {
  const rows = [...nav.querySelectorAll<HTMLElement>(ROWS)];
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
      // A list that is closing still shows its motion, but its links take no focus or reading.
      entry.panel.inert = !expanded(entry);
    }
  };
  layOut(true);
  // A list that closes can leave less to scroll than the column has scrolled; when it leaves the page
  // the scroll clamps. The rows end where the clamp will put them, so settling moves nothing.
  // A reader's scroll during the motion ends it (see the scroll listener): the compensation is then never stale.
  // Measured from the last row's box, not scrollHeight, which counts a motion's translates.
  const last = rows.at(-1);
  const bottom = last
    ? last.offsetTop +
      last.offsetHeight +
      Number.parseFloat(getComputedStyle(last).marginBlockEnd) +
      Number.parseFloat(getComputedStyle(nav).paddingBlockEnd)
    : 0;
  const clamp = scroll - Math.max(0, Math.min(scroll, bottom - nav.clientHeight));
  for (const row of rows) tops.set(row, row.offsetTop + clamp);
  for (const entry of groups) heights.set(entry, entry.group.offsetHeight);
  layOut(false);
  // Every read of the layout in flight before the first write, so the press lays out no more than twice.
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
  // The final layout may have clamped the scroll; the layout in flight is as tall as before.
  // The script's own restore is not the reader's scroll: its value is remembered, and the listener
  // ignores the scroll event it raises. A write that changes nothing raises no event, so it is not
  // remembered, or the reader's next scroll near that value would be taken for it.
  if (nav.scrollTop !== scroll) {
    restored = scroll;
    nav.scrollTop = scroll;
  }

  // The furthest anything moves. A long list covers more ground in the same time, so its first frame is
  // faster than a short list's; the duration grows with that reach (up to three times the token) to keep it even.
  const reach = Math.max(
    0,
    ...rows.map((row) => Math.abs((wasTop.get(row) ?? 0) - (tops.get(row) ?? 0))),
    ...groups.map((entry) => Math.abs((heights.get(entry) ?? 0) - (wasHeight.get(entry) ?? 0))),
  );
  const base = Number.parseFloat(token(open ? "--duration-enter" : "--duration-state"));
  const timing: KeyframeAnimationOptions = {
    // shortcut: 200px is the reach a list of the nav's usual size moves; longer lists grow the duration, capped at 3x.
    duration: base * Math.min(3, Math.max(1, reach / 200)),
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
    // The clip cuts only the bottom edge; its top and sides reach a rem past the box, so a focus ring on the chevron is not cut.
    entry.group.style.clipPath = `inset(-1rem -1rem ${height - end}px -1rem round ${radius})`;
    const push = end - (wasHeight.get(entry) ?? end);
    if (Math.abs(push) >= 0.5) {
      flight.push(
        entry.group.animate({ clipPath: [`inset(0 0 ${push}px 0)`, "inset(0 0 0 0)"] }, timing),
      );
    }
    // Only the pressed group's fade changes target; another group's running fade already ends where it should.
    const fade = expanded(entry) ? 1 : 0;
    if (entry === pressed && !entry.panel.hidden && faded.get(entry) !== fade) {
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
    if (nav && wide.matches && !still.matches) move(nav, entry, open);
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
  reveal();
});

// The reader scrolling the column during a motion ends it at once: the rows' compensation was taken at
// the press, so a scroll would leave it stale. The script's own restore is ignored.
document.querySelector<HTMLElement>(".app-nav")?.addEventListener("scroll", (event) => {
  const nav = event.currentTarget as HTMLElement;
  // Engines may land a fraction of a pixel off the value written, so the restore is matched within 1px.
  if (restored !== null && Math.abs(nav.scrollTop - restored) < 1) {
    restored = null;
    return;
  }
  if (flight.length) settle();
});

// Reduced motion turned on during a motion ends it, as a press under it would.
still.addEventListener("change", () => {
  if (still.matches) settle();
});

// Every link loads a new page, so the column starts at its top, and a page deep in a long list opened
// with its own row out of sight. The column scrolls once, at load, to centre that row.
function reveal(): void {
  const nav = document.querySelector<HTMLElement>(".app-nav");
  const here = nav?.querySelector<HTMLElement>('.guide-nav-subitem[aria-current="page"]');
  if (!nav || !here || !wide.matches) return;
  const box = nav.getBoundingClientRect();
  const row = here.getBoundingClientRect();
  if (row.top >= box.top && row.bottom <= box.bottom) return;
  nav.scrollTop += row.top - box.top - (box.height - row.height) / 2;
}

syncCurrent();
reveal();
