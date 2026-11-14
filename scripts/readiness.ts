// The agent-readiness scorecard's summary, computed from its table (docs/agent-readiness.md, DS-14).
// The page is scored by hand and by a blind rescore at the end of each plan step; its summary line is
// what a reader quotes, so docsCheck.mjs fails when the line no longer follows from the table.
//
// The rules are the rubric's own (agentreadydesign.com, RUBRIC.md section 4): the foundation floor is
// the lowest score in categories 1 to 4, the retrieval level the highest in category 5, the median the
// median of all 31 criteria; the tier is the informal mapping in "Maturity tiers".

/** Every criterion of the rubric v0.1, so a dropped or duplicated row fails too. */
export const CRITERIA = [
  ...["1.1", "1.2", "1.3", "1.4"],
  ...["2.1", "2.2", "2.3", "2.4", "2.5"],
  ...["3.1", "3.2", "3.3", "3.4"],
  ...["4.1", "4.2", "4.3"],
  ...["5.1", "5.2", "5.3", "5.4"],
  ...["6.1", "6.2", "6.3"],
  ...["7.1", "7.2", "7.3", "7.4"],
  ...["8.1", "8.2", "8.3", "8.4"],
];

const ROW = /^\|\s*(\d\.\d)\s*\|[^|]*\|\s*(\d)\s*\|/;
// A category row is found by its label alone, so a floor or median in the wrong shape is reported,
// not skipped.
const CATEGORY = /^\|\s*(\d)\.\s[^|]*\|([^|]*)\|([^|]*)\|/;
const SUMMARY = /^Summary: floor (\d), retrieval (\d), median (\d), tier (\d)\.$/m;
/** Our own criteria (DS-19), scored apart and never in the tier, with their own line. */
export const OWN_CRITERIA = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
const OWN_ROW = /^\|\s*(S\d+)\s*\|[^|]*\|\s*(\d)\s*\|/;
const OWN = /^Ours: lowest (\d), median (\d+(?:\.5)?)\.$/m;

type Rollup = { floor: number; retrieval: number; median: number; tier: number };

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? (sorted[middle] ?? 0)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

export function rollup(scores: Map<string, number>): Rollup {
  const of = (category: number): number[] =>
    [...scores].filter(([id]) => id.startsWith(`${category}.`)).map(([, score]) => score);
  const floor = Math.min(...[1, 2, 3, 4].flatMap(of));
  const retrieval = Math.max(...of(5));
  const middle = median([...scores.values()]);
  // The rubric's tiers name their conditions; a system that meets none of a tier's takes the one
  // below (floor 2 with a median under 2 is tier 1, as is floor 2 with retrieval 0 or 1). Tier 4 is
  // every criterion at 3 or more, which puts category 8 (evals, trust, drift) there too.
  const tier =
    Math.min(...scores.values()) >= 3
      ? 4
      : floor >= 3 && retrieval >= 3 && middle >= 3
        ? 3
        : floor >= 2 && retrieval >= 2 && middle >= 2
          ? 2
          : floor >= 2
            ? 1
            : 0;
  return { floor, retrieval, median: middle, tier };
}

/** The rows a table scores, by id: each one of `ids` once, from 0 to 4. */
function scored(text: string, row: RegExp, ids: string[]) {
  const problems: string[] = [];
  const scores = new Map<string, number>();
  for (const line of text.split("\n")) {
    const match = row.exec(line);
    if (!match) continue;
    const id = match[1] ?? "";
    const score = Number(match[2]);
    if (!ids.includes(id)) problems.push(`${id} is not a criterion of this page`);
    else if (scores.has(id)) problems.push(`${id} is scored twice`);
    else if (score > 4) problems.push(`${id} scores ${score}, above 4`);
    else scores.set(id, score);
  }
  const missing = ids.filter((id) => !scores.has(id));
  if (missing.length > 0) problems.push(`no score for ${missing.join(", ")}`);
  return { scores, problems };
}

/** What is wrong with the page's tables or its lines; empty when they hold. */
export function readinessProblems(text: string): string[] {
  return [...rubricProblems(text), ...ownProblems(text)];
}

/** The rubric's 31 rows, its summary line and its by-category table. */
function rubricProblems(text: string): string[] {
  const { scores, problems } = scored(text, ROW, CRITERIA);
  const stated = SUMMARY.exec(text);
  if (!stated) problems.push('no "Summary: floor N, retrieval N, median N, tier N." line');
  if (problems.length > 0 || !stated) return problems;

  const computed = rollup(scores);
  const [floor, retrieval, middle, tier] = stated.slice(1).map(Number);
  const said: Record<keyof Rollup, number | undefined> = { floor, retrieval, median: middle, tier };
  for (const key of Object.keys(computed) as (keyof Rollup)[]) {
    if (said[key] !== computed[key])
      problems.push(`the summary says ${key} ${said[key]}, the table gives ${computed[key]}`);
  }
  // The by-category table, when the page has one, follows the criteria too.
  for (const line of text.split("\n")) {
    const match = CATEGORY.exec(line);
    if (!match) continue;
    const category = match[1] ?? "";
    const values = [...scores].filter(([id]) => id.startsWith(`${category}.`)).map(([, s]) => s);
    const [low, mid] = [(match[2] ?? "").trim(), (match[3] ?? "").trim()];
    // Compared as text, so an empty cell or a stray word fails like a wrong number.
    if (low !== String(Math.min(...values)) || mid !== String(median(values)))
      problems.push(
        `category ${category} says floor ${low}, median ${mid}; the table gives ${Math.min(...values)}, ${median(values)}`,
      );
  }
  return problems;
}

/** Our own eight rows and their "Ours:" line, which the page must have. */
function ownProblems(text: string): string[] {
  const stated = OWN.exec(text);
  const { scores, problems } = scored(text, OWN_ROW, OWN_CRITERIA);
  if (!stated) return [...problems, 'no "Ours: lowest N, median N." line'];
  if (problems.length > 0) return problems;
  const [lowest, middle] = [Math.min(...scores.values()), median([...scores.values()])];
  if (stated[1] !== String(lowest) || stated[2] !== String(middle))
    problems.push(
      `our line says lowest ${stated[1]}, median ${stated[2]}; our rows give ${lowest}, ${middle}`,
    );
  return problems;
}
