import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dismissToast, getToast, showToast, TOAST_MS } from "./toastStore.ts";

describe("toastStore", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    dismissToast();
    vi.useRealTimers();
  });

  it("an error stays past the timer, even one that replaced a short message whose timer was running, while a short message goes by itself", () => {
    showToast({ message: "Added to favorites", kind: "success" });
    vi.advanceTimersByTime(TOAST_MS);
    expect(getToast()).toBeNull();

    // A failure read before it goes (owner, 2026-11-10): the short one's timer must not take it.
    showToast({ message: "Added to favorites", kind: "success" });
    vi.advanceTimersByTime(TOAST_MS - 1);
    showToast({ message: "Couldn't remove it. Try again.", kind: "error" });
    vi.advanceTimersByTime(TOAST_MS * 2);
    expect(getToast()?.kind).toBe("error");
  });
});
