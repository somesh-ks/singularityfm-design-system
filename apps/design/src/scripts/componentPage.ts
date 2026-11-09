/**
 * A component page's preview. The page draws every state of the controls (the library's own markup,
 * hidden but the first); this shows the one the controls name and puts its code in the snippet. The
 * rest is the little a stage needs to be touched: opening an overlay, keeping a slider's fill, moving
 * a section tab, choosing a segmented nav's view, taking a row out.
 */
import { mountSegmentedNav } from "@singularity/design-system/segmentedNav";
import { installSelectSheet } from "@singularity/design-system/selectSheet";

// A phone opens a Select's list as the standard bottom sheet (selectSheet.ts): the page installs it once.
installSelectSheet();

const root = document.querySelector<HTMLElement>("[data-playground]");
const snippet = document.querySelector<HTMLElement>("[data-code-section] .code-snippet-text");

if (root) {
  const controls = Array.from(
    root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-control]"),
  );
  const states = Array.from(root.querySelectorAll<HTMLElement>("[data-combo]"));

  const show = (): void => {
    const key = controls
      .map((control) =>
        control instanceof HTMLInputElement ? (control.checked ? "on" : "off") : control.value,
      )
      .join("|");
    for (const state of states) {
      state.hidden = state.dataset.combo !== key;
      if (!state.hidden && snippet && state.dataset.code) snippet.textContent = state.dataset.code;
    }
  };
  // A segmented nav chooses as on an app page: its script, mounted once for each list (DS-8).
  for (const list of root.querySelectorAll<HTMLElement>('[role="tablist"]'))
    mountSegmentedNav(list, () => {});
  // A reload keeps what the controls last said; the page draws the first state.
  if (controls.length) {
    show();
    root.addEventListener("change", show);
  }

  root.addEventListener("click", (event) => {
    const target = event.target as Element;
    // The real overlays are modal or popovers; their own scripts live in the app, so close and open are here.
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
