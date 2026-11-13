/**
 * A component page's preview. The page draws every state of the controls (the library's own markup,
 * hidden but the first); this shows the one the controls name and puts its code in the snippet. The
 * rest is the little a stage needs to be touched: opening an overlay, keeping a slider's fill, moving
 * a section tab, choosing a segmented nav's view, taking a row out.
 */
import { mountSegmentedNav } from "@singularity/design-system/segmentedNav";
import { installSelectSheet } from "@singularity/design-system/selectSheet";
import { showToast } from "@singularity/design-system/toastStore";
import { inCode } from "../lib/codeWords";

// A phone opens a Select's list as the standard bottom sheet (selectSheet.ts): the page installs it once.
installSelectSheet();

const root = document.querySelector<HTMLElement>("[data-playground]");
const snippet = document.querySelector<HTMLElement>("[data-code-section] .code-snippet-text");

if (root) {
  const controls = Array.from(
    root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-control]"),
  );
  const states = Array.from(root.querySelectorAll<HTMLElement>("[data-combo]"));

  // The editable words (a page's text controls): every state draws each sample, so the text nodes that say one
  // exactly are found once and rewritten as it is typed; the code says it in quotes or between tags.
  const fields = Array.from(root.querySelectorAll<HTMLInputElement>("input[data-sample]"));
  const words = new Map(fields.map((field) => [field.dataset.sample ?? "", field.value]));
  const said: { node: Text; sample: string; edges: [string, string] }[] = [];
  // A control named by its words (a FAB's aria-label) is renamed with them, so its name is what it says.
  const named = states.flatMap((state) =>
    Array.from(state.querySelectorAll<HTMLElement>("[aria-label]")).filter((element) =>
      words.has(element.getAttribute("aria-label") ?? ""),
    ),
  );
  const names = new Map(
    named.map((element) => [element, element.getAttribute("aria-label") ?? ""]),
  );
  for (const state of states) {
    const walker = document.createTreeWalker(state, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node as Text;
      const sample = text.data.trim();
      if (!words.has(sample)) continue;
      const at = text.data.indexOf(sample);
      said.push({
        node: text,
        sample,
        edges: [text.data.slice(0, at), text.data.slice(at + sample.length)],
      });
    }
  }
  const literal = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // One pass for every sample, so words typed in one field that equal another's sample stay as typed.
  const quoted = words.size
    ? new RegExp(`(["'>])(${[...words.keys()].map(literal).join("|")})(["'<])`, "g")
    : undefined;
  const reword = (code: string): string =>
    quoted
      ? code.replace(
          quoted,
          (_, open: string, sample: string, close: string, at: number, whole: string) =>
            `${open}${inCode(words.get(sample) ?? sample, open, whole[at - 1] ?? "")}${close}`,
        )
      : code;
  /** What a sample says now: the person's words where the page offers them. */
  const say = (sample: string): string => words.get(sample) ?? sample;

  const show = (): void => {
    const key = controls
      .map((control) =>
        control instanceof HTMLInputElement ? (control.checked ? "on" : "off") : control.value,
      )
      .join("|");
    for (const state of states) {
      state.hidden = state.dataset.combo !== key;
      if (!state.hidden && snippet && state.dataset.code)
        snippet.textContent = reword(state.dataset.code);
    }
  };
  const rewrite = (): void => {
    for (const { node, sample, edges } of said) node.data = `${edges[0]}${say(sample)}${edges[1]}`;
    for (const [element, sample] of names) element.setAttribute("aria-label", say(sample));
    show();
  };
  for (const field of fields)
    field.addEventListener("input", () => {
      words.set(field.dataset.sample ?? "", field.value);
      rewrite();
    });
  // A segmented nav chooses as on an app page: its script, mounted once for each list (DS-8).
  for (const list of root.querySelectorAll<HTMLElement>('[role="tablist"]'))
    mountSegmentedNav(list, () => {});
  // A reload keeps what the controls last said (the words fields keep none: they say the samples).
  if (controls.length || fields.length) {
    rewrite();
    root.addEventListener("change", show);
  }

  root.addEventListener("click", (event) => {
    const target = event.target as Element;
    // The real overlays are modal or popovers; their own scripts live in the app, so close and open are here.
    const toast = target.closest<HTMLElement>("[data-preview-toast]");
    if (toast) {
      const kind = toast.dataset.previewToast;
      showToast({
        message: say(toast.dataset.previewToastMessage ?? ""),
        kind: kind === "success" || kind === "error" ? kind : undefined,
        actionLabel: toast.dataset.previewToastAction,
        onAction: () => {},
      });
      return;
    }
    const open = target.closest<HTMLElement>("[data-preview-open]");
    if (open) {
      (
        document.getElementById(open.dataset.previewOpen ?? "") as HTMLDialogElement | null
      )?.showModal();
      return;
    }
    const close = target.closest("[data-menu-close], [data-panel-close], [data-create-close]");
    if (close) {
      const overlay = close.closest<HTMLElement>("dialog, [popover]");
      if (overlay instanceof HTMLDialogElement) overlay.close();
      else overlay?.hidePopover();
      return;
    }
    const tab = target.closest<HTMLAnchorElement>(".tab");
    if (tab) {
      event.preventDefault();
      for (const other of tab.parentElement?.querySelectorAll(".tab") ?? [])
        other.removeAttribute("aria-current");
      tab.setAttribute("aria-current", "true");
      return;
    }
    const remove = target.closest<HTMLElement>("[data-row-remove]");
    if (remove) remove.closest<HTMLElement>(".row-exit")?.setAttribute("data-removing", "");
    if (target.closest("[data-row-reset]"))
      for (const row of root.querySelectorAll(".row-exit")) row.removeAttribute("data-removing");
  });

  // The mixed switch is a property, not an attribute.
  for (const mixed of root.querySelectorAll<HTMLInputElement>("input[data-mixed]"))
    mixed.indeterminate = true;

  // A slider's fill is the share of its range up to the thumb, kept on the field it sits in.
  const fill = (input: HTMLInputElement): void => {
    const share = ((+input.value - +input.min) / (+input.max - +input.min)) * 100;
    (
      input.closest<HTMLElement>(".slider-hue-field, .slider-wave-field") ?? input
    ).style.setProperty("--range-fill", `${share}%`);
  };
  for (const slider of root.querySelectorAll<HTMLInputElement>(".slider-input")) fill(slider);
  root.addEventListener("input", (event) => {
    if ((event.target as Element).matches(".slider-input")) fill(event.target as HTMLInputElement);
  });

  if (root.querySelector(".ripple-area"))
    import("@singularity/design-system/ripple").then((ripple) => ripple.installRipple());
}
