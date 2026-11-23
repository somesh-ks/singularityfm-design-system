// Whether an agent test run moved anything (DS-18 noise rule): compares the last run's summary.json
// with the one before it, on the tasks both have. Pass a third, older summary first to let a one-task
// move count when it repeats a move of the run before. A CI run keeps its rows as the
// `agent-eval-rows-<agent>` artifact (download it from the run's page); a local run writes summary.json
// beside its transcripts.
//
//   node scripts/agentEval/compare.mjs <older summary.json> <newer summary.json>
//   node scripts/agentEval/compare.mjs <oldest> <older> <newest>
import { readFileSync } from "node:fs";
import { compareRuns } from "./grade.ts";

const files = process.argv.slice(2);
if (files.length < 2 || files.length > 3)
  throw new Error("compare.mjs takes two or three summary.json files, oldest first");
const runs = files.map((file) => {
  const rows = JSON.parse(readFileSync(file, "utf8")).rows;
  if (!Array.isArray(rows)) throw new Error(`${file} has no rows: pass a run's summary.json`);
  // A task twice in one run would let one row hide the other.
  const keys = rows.map((row) => `${row.setup} / ${row.agent} / ${row.task}`);
  const twice = keys.find((key, index) => keys.indexOf(key) !== index);
  if (twice) throw new Error(`${file} has ${twice} twice`);
  return rows;
});
/** Which way counts: a move up and a move down are judged apart (DS-18). */
const counted = ({ counts }) =>
  [counts.up && "up", counts.down && "down"].filter(Boolean).join(" and ") || "no, noise";
const shown = ([before, after]) => `${before ?? "n/a"} to ${after ?? "n/a"}`;
const lines = [];
for (const group of compareRuns(runs)) {
  lines.push(`### ${group.setup} / ${group.agent}`, "");
  if (group.runs < 2) {
    lines.push("Only the newest run has this setup and agent: nothing to compare.", "");
    continue;
  }
  if (group.shared.length === 0) {
    lines.push(`Its ${group.runs} runs share no task: nothing to compare.`, "");
    continue;
  }
  lines.push(`Compared on the ${group.shared.length} tasks its ${group.runs} runs share.`);
  if (group.leftOut.length) lines.push(`Left out (not in every run): ${group.leftOut.join(", ")}.`);
  if (group.models.length > 1)
    lines.push(
      `The runs used different models (${group.models.join(", ")}): read no change as the docs'.`,
    );
  lines.push("");
  if (group.changes.length) {
    lines.push(
      "| Measure | Before | After | Tasks up | Tasks down | Counts as a change |",
      "| --- | --- | --- | --- | --- | --- |",
    );
    for (const change of group.changes)
      lines.push(
        `| ${change.measure} | ${change.before} | ${change.after} | ${change.up} | ${change.down} | ${counted(change)} |`,
      );
  } else lines.push("No measure moved.");
  lines.push(
    "",
    `Medians over finished tasks, for information only: minutes ${shown(group.minutes)}, tokens ${shown(group.tokens)}.`,
    "",
  );
}
console.log(lines.join("\n"));
