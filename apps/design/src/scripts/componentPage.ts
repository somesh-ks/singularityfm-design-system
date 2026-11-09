/**
 * A component page's preview. The page draws every state of the controls (the library's own markup,
 * hidden but the first); this shows the one the controls name and puts its code in the snippet. The
 * rest is the little a stage needs to be touched: opening an overlay, moving a section tab, taking a
 * row out.
 */
export {};

const root = document.querySelector<HTMLElement>("[data-playground]");
const snippet = document.querySelector<HTMLElement>("[data-code-section] .code-snippet-text");

if (root) {
  // A choice is a native select; a toggle is the Switch, whose state is its aria-checked.
  const controls = Array.from(root.querySelectorAll<HTMLElement>("[data-control]"));
  const states = Array.from(root.querySelectorAll<HTMLElement>("[data-combo]"));

  const show = (): void => {
    const key = controls
      .map((control) =>
        control instanceof HTMLSelectElement
          ? control.value
          : control.getAttribute("aria-checked") === "true"
            ? "on"
            : "off",
      )
      .join("|");
    for (const state of states) {
      state.hidden = state.dataset.combo !== key;
      if (!state.hidden && snippet && state.dataset.code) snippet.textContent = state.dataset.code;
    }
  };
  // A reload keeps what the controls last said; the page draws the first state.
  if (controls.length) {
    show();
    // A Switch's hidden checkbox fires change before React writes the new aria-checked, which it does
    // once the press's handlers return; the microtask reads it after.
    root.addEventListener("change", () => queueMicrotask(show));
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

  if (root.querySelector(".ripple-area"))
    import("@singularity/design-system/ripple").then((ripple) => ripple.installRipple());
}
