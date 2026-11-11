import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";

// Prevents a radio group, select or slider shipping with no accessible name and no one told: a screen
// reader says only "slider". The types cannot require a name (an outside <label for> is one), so the
// components warn in development; a named control, and production, stay quiet.
describe("an unnamed control", () => {
  let warn: MockInstance<typeof console.warn>;
  let named = 0;

  beforeEach(() => {
    vi.resetModules();
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    warn.mockRestore();
  });

  async function draw(): Promise<void> {
    const { default: SegmentedChoice } = await import("./SegmentedChoice.tsx");
    const { default: Select } = await import("./Select.tsx");
    const { default: Slider } = await import("./Slider.tsx");
    const options = [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ];
    // Named each way a caller names them: none of these warns.
    renderToStaticMarkup(h(SegmentedChoice, { name: "n", options, "aria-label": "Length" }));
    renderToStaticMarkup(h(Select, { label: "Sort" }));
    renderToStaticMarkup(h(Select, { id: "sort" }));
    renderToStaticMarkup(h(Slider, { "aria-labelledby": "speed" }));
    renderToStaticMarkup(h(Slider, { id: "speed" }));
    // Checked before the unnamed ones, whose warning a named control's would otherwise hide (once each).
    named = warn.mock.calls.length;
    // Unnamed, twice each (a blank label names nothing): one warning per component.
    for (let time = 0; time < 2; time++) {
      renderToStaticMarkup(h(SegmentedChoice, { name: "n", options, id: "not-a-name" }));
      renderToStaticMarkup(h(Select, { label: "  " }));
      renderToStaticMarkup(h(Slider, {}));
    }
  }

  it("warns once per component in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await draw();
    expect(named).toBe(0);
    const said = warn.mock.calls.map(([message]) => String(message));
    expect(said).toHaveLength(3);
    for (const name of ["SegmentedChoice", "Select", "Slider"]) {
      expect(said.filter((message) => message.includes(`a ${name} has`))).toHaveLength(1);
    }
  });

  it("stays quiet in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await draw();
    expect(warn).not.toHaveBeenCalled();
  });
});
