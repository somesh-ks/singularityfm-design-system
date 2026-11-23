import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { System } from "../../packages/design-system/scripts/system/types.ts";
import { compareRuns, exportTarget, gradeFiles, runStats, type SummaryRow } from "./grade.ts";

const PKG = join(import.meta.dirname, "../../packages/design-system");
const { tasks, components_at_freeze: atFreeze } = JSON.parse(
  readFileSync(join(import.meta.dirname, "tasks.json"), "utf8"),
) as {
  components_at_freeze: string[];
  tasks: { id: string; prompt: string; expect: { components?: string[] }[] }[];
};
// Words only, so punctuation or a line break between them hides no copied phrase.
const words = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z']+/)
    .filter(Boolean);
const system = JSON.parse(readFileSync(join(PKG, "tokens/system.json"), "utf8")) as System;

describe("the agent test's tasks", () => {
  // Prevents a task that names its answer: "add a Toast" tests copying a name, not finding the part,
  // so the score would say agents find parts when they were told which.
  it("never name a component or a part", () => {
    const names = [
      ...system.components.map((component) => component.name),
      ...system.parts.map((part) => part.id),
    ];
    const named = tasks.flatMap((task) =>
      names
        .filter((name) =>
          new RegExp(`\\b${name.replace(/-/g, "[- ]")}s?\\b`, "i").test(task.prompt),
        )
        .map((name) => `${task.id}: ${name}`),
    );
    expect(named).toEqual([]);
  });

  // Prevents teaching to the test: a docs change that copies a task's words into what agents read
  // would raise the score without making the docs any better for a new ask.
  it("are not quoted by anything the package gives an agent", () => {
    const docs = [
      "AGENTS.md",
      ...readdirSync(join(PKG, "tokens"))
        .filter((file) => /\.(md|txt|json)$/.test(file))
        .map((file) => `tokens/${file}`),
      ...readdirSync(join(PKG, "tokens/parts")).map((file) => `tokens/parts/${file}`),
    ].map((file) => words(readFileSync(join(PKG, file), "utf8")).join(" "));
    const quoted = tasks.flatMap((task) => {
      const words = task.prompt
        .toLowerCase()
        .replace(/[^a-z' ]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
      const runs = words.slice(0, -5).map((_, index) => words.slice(index, index + 6).join(" "));
      return runs
        .filter((run) => docs.some((doc) => doc.includes(run)))
        .map((run) => `${task.id}: ${run}`);
    });
    expect(quoted).toEqual([]);
  });

  // Prevents a component the test never measures: one added after the freeze with no task that
  // expects it scores nothing whether agents find it or not, and the scorecard would not say so.
  it("expect every component added since the freeze", () => {
    const expected = new Set(
      tasks.flatMap((task) => task.expect.flatMap((want) => want.components ?? [])),
    );
    const untested = system.components
      .map((component) => component.name)
      .filter((name) => !atFreeze.includes(name) && !expected.has(name));
    expect(untested).toEqual([]);
  });
});

describe("the agent test's grading", () => {
  // Prevents scoring an invented import as a real one. The exports map ends in a catch-all `./*`, so
  // a made-up component or a deep source path still matches a key; only the file it loads tells.
  it("tells an invented import from one the package serves", () => {
    const exportsMap = (
      JSON.parse(readFileSync(join(PKG, "package.json"), "utf8")) as {
        exports: Record<string, string>;
      }
    ).exports;
    const resolves = (subpath: string) => {
      const target = exportTarget(subpath, exportsMap);
      return target !== null && existsSync(join(PKG, target));
    };
    const name = "@singularityfm/design-system";
    const text = [
      "---",
      ...[
        "Button",
        "toastStore",
        "styles/tokens.css",
        "Card",
        "src/Button.tsx",
        "styles/card.css",
      ].map((path, index) => `import x${index} from "${name}/${path}";`),
      "---",
    ].join("\n");
    const grade = gradeFiles([{ path: "a.astro", text }], resolves, [{ components: ["Button"] }]);
    expect(grade.invented.sort()).toEqual([
      `${name}/Card`,
      `${name}/src/Button.tsx`,
      `${name}/styles/card.css`,
    ]);
    expect(grade.met).toBe(1);
    // An import left in a comment or written inside a string earns nothing: the agent did not use
    // the part.
    const commented = [
      "---",
      `// import Toast from "${name}/Toast";`,
      `/* import Dialog from "${name}/Dialog"; */`,
      `const example = \`import Toast from "${name}/Toast";\`;`,
      `const label = "hello"// import Dialog from "${name}/Dialog";`,
      "---",
      `<p>import Toast from "${name}/Toast";</p>`,
      `<!-- <div class="empty-state"></div> -->`,
    ].join("\n");
    const none = gradeFiles([{ path: "b.astro", text: commented }], resolves, [
      { components: ["Toast"] },
      { components: ["Dialog"] },
      { classes: ["empty-state"] },
    ]);
    expect(none.met).toBe(0);
  });
});

describe("the agent test's transcripts", () => {
  // Prevents an Antigravity run reading as unfinished, `ds` unused and the guide unread because its
  // stream has another shape than Claude Code's. Event shapes: antigravity.google/docs/cli/headless.
  it("reads an Antigravity stream as well as a Claude Code one", () => {
    const step = (index: number, state: string, tool: Record<string, unknown>) => ({
      event: "step_update",
      step_update: {
        step_index: index,
        state,
        step_type: "tool",
        tool_name: tool.name,
        tool_info: tool,
      },
    });
    const ds = {
      name: "run_command",
      parameters: { CommandLine: 'pnpm exec ds find "empty list"' },
    };
    const guide = {
      name: "view_file",
      parameters: {
        AbsolutePath: "C:\\app\\node_modules\\@singularityfm\\design-system\\AGENTS.md",
      },
    };
    const transcript = [
      {
        event: "init",
        init: { cwd: "/app", tools: ["run_command"], permission_mode: "always-proceed" },
      },
      step(1, "ACTIVE", ds),
      step(1, "DONE", ds),
      step(2, "DONE", guide),
      {
        event: "result",
        result: {
          status: "SUCCESS",
          num_turns: 1,
          usage: { input_tokens: 9, output_tokens: 1, total_tokens: 10 },
        },
      },
    ]
      .map((event) => JSON.stringify(event))
      .join("\n");
    const stats = runStats(transcript, "antigravity");
    expect([stats.finished, stats.usedDs, stats.readGuide, stats.toolCalls]).toEqual([
      true,
      true,
      true,
      2,
    ]);
    expect(stats.tokens).toBeGreaterThan(0);
    // Claude Code's partial-message events also carry an `event` key; its run must not read as one.
    const claude = [
      { type: "system", subtype: "init", model: "m" },
      { type: "stream_event", event: { type: "message_start" } },
      { type: "result", num_turns: 1, usage: { input_tokens: 1 } },
    ]
      .map((event) => JSON.stringify(event))
      .join("\n");
    expect(runStats(claude, "claude").finished).toBe(true);
  });
});

describe("the agent test's comparison", () => {
  const row = (task: string, pass: boolean): SummaryRow => ({
    setup: "bare",
    agent: "claude",
    task,
    finished: true,
    met: pass ? 1 : 0,
    of: 1,
    invented: [],
    outside_ui: [],
    validate_errors: 0,
    compiled: true,
    used_ds: false,
    read_guide: false,
    minutes: 1,
    tokens: 1,
  });
  const run = (passing: string[], ids = ["a", "b", "c", "d"]) =>
    ids.map((id) => row(id, passing.includes(id)));
  // Only one measure differs between these rows, so a run has at most one change.
  const verdicts = (...runs: SummaryRow[][]) =>
    compareRuns(runs)[0]?.changes.map(({ counts }) =>
      counts.up && counts.down ? "both" : counts.up ? "up" : counts.down ? "down" : "noise",
    );

  // Prevents reading one agent's coin flip on one task as the docs working, two tasks that swap
  // places as no change, a lone move down riding on two moves up, a task that only the newer run has
  // from moving the count at all, and a count that did not read passing as the right part.
  it("counts a move only when it is larger than chance or repeats", () => {
    expect(verdicts(run([]), run(["a"]))).toEqual(["noise"]);
    expect(verdicts(run([]), run(["a", "b"]))).toEqual(["up"]);
    expect(verdicts(run([]), run(["a"]), run(["a", "b"]))).toEqual(["up"]);
    expect(verdicts(run(["a"]), run([]), run(["b"]))).toEqual(["noise"]);
    expect(verdicts(run(["a", "b"]), run(["c", "d"]))).toEqual(["both"]);
    expect(verdicts(run(["a"]), run(["b", "c"]))).toEqual(["up"]);
    const unread = run([]).map((one) => ({ ...one, met: null, of: null }));
    expect(verdicts(run([]), unread)).toEqual([]);
    const added = compareRuns([run([]), run(["e"], ["a", "b", "c", "d", "e"])])[0];
    expect(added?.changes).toEqual([]);
    expect(added?.leftOut).toEqual(["e"]);
  });
});
