import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { flagBadgeClass, flagClass, flagParts, flagSrc, hasFlagArt } from "./flag.ts";
import Icon from "./Icon.tsx";
import { createVelocityTracker, swipeLeaves, TAP_SLOP_PX } from "./swipe.ts";
import { dismissToast, getToast, subscribeToast, type ToastContent } from "./toastStore.ts";
// A message that names a place draws the Flag's art, so the Toast brings the Flag's rules too.
import "../styles/flag.css";
import "../styles/toast.css";

/**
 * The Toast: a top-layer popover on the inverse surface, centred above whatever the page docks at the
 * bottom (styles/toast.css reads where from custom properties the page sets). It shows what
 * toastStore.ts holds, so a page mounts it once, as a client island, and anything calls showToast()
 * or sendToast(). Its role speaks its message (status, or alert for an error), so whoever shows a
 * toast does not announce it again; the toast itself never steals focus.
 */
export default function Toast() {
  const toast = useSyncExternalStore(subscribeToast, getToast, () => null);
  // The content outlives the toast for the length of its exit transition.
  const [shown, setShown] = useState<ToastContent | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toast) setShown(toast);
  }, [toast]);

  // A toast that states an outcome asks the page for its sound (the reader's uiSound.ts plays it);
  // a plain message stays quiet.
  const id = toast?.id;
  const kind = toast?.kind;
  // biome-ignore lint/correctness/useExhaustiveDependencies: the id re-sounds an identical message
  useEffect(() => {
    if (!kind) return;
    document.dispatchEvent(
      new CustomEvent("singularity:sound", { detail: kind === "error" ? "failure" : "success" }),
    );
  }, [id, kind]);

  useEffect(() => {
    const element = ref.current;
    // Safari before 17 has no Popover API, and asking it about :popover-open throws. There the
    // toast is not shown; its text still reaches a screen reader through the live region.
    if (!element || typeof element.showPopover !== "function") return;
    // A toast that was swiped away left its slide behind; the next one starts in place.
    if (toast) element.style.translate = "";
    const open = element.matches(":popover-open");
    if (toast && !open) element.showPopover();
    else if (!toast && open) element.hidePopover();
  }, [toast]);

  // A finger slides the toast sideways, as Material's snackbar goes: once it has moved past the tap
  // slop sideways it is a swipe, and on release it leaves when the shared rule says so
  // (swipe.ts: a share of the width, or speed over the last 100 ms, never under twice the
  // slop) or springs back. Its buttons keep their presses, and a mouse never drags it.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const tracker = createVelocityTracker();
    // The toast a press began on: a newer message that replaced it is never what the swipe takes.
    let press: {
      id: number;
      toast: number | undefined;
      x: number;
      y: number;
      swiping: boolean;
      dx: number;
    } | null = null;
    const onDown = (event: PointerEvent): void => {
      if (event.pointerType === "mouse" || (event.target as Element).closest("button")) return;
      press = {
        id: event.pointerId,
        toast: getToast()?.id,
        x: event.clientX,
        y: event.clientY,
        swiping: false,
        dx: 0,
      };
      tracker.reset({ value: event.clientX, t: event.timeStamp });
    };
    const onMove = (event: PointerEvent): void => {
      if (!press || event.pointerId !== press.id) return;
      const dx = event.clientX - press.x;
      const dy = event.clientY - press.y;
      tracker.push(event.clientX, event.timeStamp);
      if (!press.swiping) {
        if (Math.abs(dx) < TAP_SLOP_PX || Math.abs(dx) <= Math.abs(dy)) return;
        press.swiping = true;
        element.setPointerCapture(event.pointerId);
        element.dataset.dragging = "";
      }
      press.dx = dx;
      element.style.translate = `${dx}px 0`;
    };
    const onUp = (event: PointerEvent): void => {
      if (!press || event.pointerId !== press.id) return;
      const { swiping, dx, toast } = press;
      press = null;
      if (!swiping) return;
      delete element.dataset.dragging;
      // The lift is a sample too: a drag that stopped before it is not a flick.
      tracker.push(event.clientX, event.timeStamp);
      const current = getToast();
      // A cancelled touch (the browser took the gesture) or a message that replaced the pressed
      // one springs back; only a released swipe of the same toast takes it away.
      // Leaving, it keeps sliding the way it went while the popover's own exit fades it.
      if (
        event.type === "pointerup" &&
        current?.id === toast &&
        swipeLeaves(dx, element.offsetWidth, tracker.velocity())
      ) {
        element.style.translate = `${Math.sign(dx) * element.offsetWidth * 1.5}px 0`;
        current?.onDismiss?.();
        dismissToast();
      } else element.style.translate = "";
    };
    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerup", onUp);
    element.addEventListener("pointercancel", onUp);
    return () => {
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="toast"
      popover="manual"
      role={shown?.kind === "error" ? "alert" : "status"}
      data-one-line={shown?.oneLine ? "" : undefined}
    >
      {shown?.kind ? (
        <Icon className="toast-icon" name={shown.kind === "error" ? "alert" : "check"} />
      ) : null}
      {/* Keyed by the message's id, so the same words shown again are new text the live region
          speaks again. */}
      <span key={shown?.id} className="toast-text">
        {/* A place's flag is the Flag's art, never the emoji Windows draws as two letters (D367). */}
        {flagParts(shown?.message ?? "").map((part, index) =>
          typeof part === "string" ? (
            part
          ) : !hasFlagArt(part.region) ? (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: the parts of one fixed message
              key={index}
              className={flagBadgeClass(true)}
              data-code={part.region}
              aria-hidden="true"
            />
          ) : (
            <img
              // biome-ignore lint/suspicious/noArrayIndexKey: the parts of one fixed message
              key={index}
              className={flagClass(true)}
              src={flagSrc(part.region)}
              alt=""
              aria-hidden="true"
              decoding="async"
            />
          ),
        )}
      </span>
      {shown?.actionLabel ? (
        <button
          className="toast-action"
          type="button"
          onClick={() => {
            dismissToast();
            shown.onAction?.();
          }}
        >
          {shown.actionLabel}
        </button>
      ) : null}
      {shown?.actionLabel ? (
        <button
          className="toast-dismiss press"
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            shown.onDismiss?.();
            dismissToast();
          }}
        >
          <Icon name="close" />
        </button>
      ) : null}
    </div>
  );
}
