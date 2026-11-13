import { describe, expect, it } from "vitest";
import { CRITERIA, readinessProblems } from "./readiness.ts";

// A page with every criterion at 2 unless overridden, the summary line a reader quotes, and the
// by-category rows.
function page(scores: Record<string, number>, summary: string, categories: string[] = []): string {
  const rows = CRITERIA.map(
    (id) => `| ${id} | criterion | ${scores[id] ?? 2} | why | next | plan |`,
  );
  return [summary, "", ...categories, "", "| Id | Criterion | Score |", "| --- |", ...rows].join(
    "\n",
  );
}

describe("the agent-readiness scorecard", () => {
  // Prevents publishing a summary that a rescore left behind: a criterion in categories 1 to 4 drops
  // to 0 and the page still says floor 2 and tier 2, so the number quoted to the owner is wrong.
  it("fails when the summary no longer follows from the table", () => {
    const rescored = { "4.1": 0, "5.2": 1 };
    const right = "Summary: floor 0, retrieval 2, median 2, tier 0.";
    expect(readinessProblems(page(rescored, right))).toEqual([]);
    const stale = readinessProblems(
      page(rescored, "Summary: floor 2, retrieval 2, median 2, tier 2."),
    );
    expect(stale).toHaveLength(2);
    expect(stale.join("\n")).toMatch(/floor[\s\S]*tier/);
  });

  // Prevents the by-category table going stale while the summary is fixed: category 4's floor stays
  // at 2 after 4.1 drops to 0.
  it("fails when a category row no longer follows from its criteria", () => {
    const summary = "Summary: floor 0, retrieval 2, median 2, tier 0.";
    const rows = (floor: number) => [`| 4. Composition and layout | ${floor} | 2 |`];
    expect(readinessProblems(page({ "4.1": 0 }, summary, rows(0)))).toEqual([]);
    expect(readinessProblems(page({ "4.1": 0 }, summary, rows(2)))).toHaveLength(1);
    // A median no table could give (1.6) must fail too, not drop the row from the check.
    const odd = [`| 4. Composition and layout | 0 | 1.6 |`];
    expect(readinessProblems(page({ "4.1": 0 }, summary, odd))).toHaveLength(1);
  });

  // Prevents a summary computed over fewer than 31 rows: a criterion deleted or pasted twice in an
  // edit still yields a floor and a median, of the wrong set.
  it("fails on a missing or repeated criterion", () => {
    const text = page({}, "Summary: floor 2, retrieval 2, median 2, tier 2.");
    const problems = readinessProblems(
      text.replace(/^\| 7\.2 .*$/m, "| 7.1 | c | 2 | w | n | p |"),
    );
    expect(problems).toHaveLength(2);
    expect(problems.join("\n")).toMatch(/7\.1[\s\S]*7\.2/);
  });
});
