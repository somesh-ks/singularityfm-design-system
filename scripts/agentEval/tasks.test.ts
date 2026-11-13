import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { System } from "../../packages/design-system/scripts/system/types.ts";
import { exportTarget, gradeFiles } from "./grade.ts";

const PKG = join(import.meta.dirname, "../../packages/design-system");
const { tasks } = JSON.parse(readFileSync(join(import.meta.dirname, "tasks.json"), "utf8")) as {
  tasks: { id: string; prompt: string }[];
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
      "Button",
      "toastStore",
      "styles/tokens.css",
      "Card",
      "src/Button.tsx",
      "styles/card.css",
    ]
      .map((path, index) => `import x${index} from "${name}/${path}";`)
      .join("\n");
    const grade = gradeFiles([{ path: "a.astro", text }], resolves, [{ components: ["Button"] }]);
    expect(grade.invented.sort()).toEqual([
      `${name}/Card`,
      `${name}/src/Button.tsx`,
      `${name}/styles/card.css`,
    ]);
    expect(grade.met).toBe(1);
  });
});
