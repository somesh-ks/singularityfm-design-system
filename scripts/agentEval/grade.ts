// Mechanical grading for the agent test (DS-14): what an agent wrote, and how it went about it, read
// from its files and its transcript with no model call. run.mjs calls these after each task.

import ts from "typescript";

export const PACKAGE = "@singularityfm/design-system";

/** One expectation: any of these components imported, or any of these classes used. */
export type Expect = { components?: string[]; classes?: string[] };
export type Written = { path: string; text: string };

// UI libraries an app built on this system has no reason to reach for.
const OUTSIDE_UI =
  /^(@mui\/|@radix-ui\/|@headlessui\/|@chakra-ui\/|@mantine\/|antd$|react-bootstrap|bootstrap|lucide-react|@heroicons\/|react-icons|@\/components\/ui\/)/;

/** The text with its HTML comments cut, repeated until none is left, so a comment the cut rebuilds
 * (`<!-<!-- -->- -->`) goes too. */
function withoutHtmlComments(text: string): string {
  let html = text;
  for (let last = ""; last !== html; ) {
    last = html;
    html = html.replace(/<!--[\s\S]*?-->/g, "");
  }
  return html;
}

/**
 * The text with its comments blanked, so a class left in a comment earns no credit. A `//` after a
 * colon or a quote is kept: it starts a URL, not a comment.
 */
// shortcut: a regex, not a parser, so `//` or `/*` inside a string literal still counts as a
// comment. It reads only classes and CSS `@import`s (imports go through the TypeScript scanner
// below); upgrade to the Astro compiler if a run is ever graded wrong by it.
function code(text: string): string {
  return withoutHtmlComments(text)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

/**
 * What a file imports. Script is read by the TypeScript scanner, so an import in a comment or a
 * string is not one; an Astro file's script is its frontmatter and its `<script>` blocks, and the
 * page text around them imports nothing. A stylesheet's `@import`s are read from its text.
 */
function specifiers(file: Written): string[] {
  if (file.path.endsWith(".css"))
    return [...code(file.text).matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)].map(
      (m) => m[1] ?? "",
    );
  const text = withoutHtmlComments(file.text);
  const scripts = file.path.endsWith(".astro")
    ? [
        /^\s*---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? "",
        ...[...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script[^>]*>/gi)].map((m) => m[1] ?? ""),
      ]
    : [file.text];
  return scripts.flatMap((script) =>
    ts.preProcessFile(script, true, true).importedFiles.map((ref) => ref.fileName),
  );
}

function classesIn(text: string): Set<string> {
  const values = [
    ...text.matchAll(/\bclass(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/g),
  ];
  return new Set(values.flatMap((match) => (match[1] ?? match[2] ?? match[3] ?? "").split(/\s+/)));
}

/**
 * The file `<package>/<subpath>` loads, by the exports map's rules (an exact key first, then the
 * pattern with the longest prefix), or null when no key matches. The map ends in a catch-all `./*`,
 * so whether that file exists is what tells a real import from an invented one.
 */
export function exportTarget(subpath: string, exportsMap: Record<string, string>): string | null {
  const key = `./${subpath}`;
  if (typeof exportsMap[key] === "string") return exportsMap[key];
  const patterns = Object.keys(exportsMap)
    .filter((pattern) => pattern.includes("*"))
    .sort((a, b) => b.indexOf("*") - a.indexOf("*"));
  for (const pattern of patterns) {
    const [head = "", tail = ""] = pattern.split("*");
    if (!key.startsWith(head) || !key.endsWith(tail) || key.length <= head.length + tail.length)
      continue;
    return (exportsMap[pattern] ?? "").replaceAll(
      "*",
      key.slice(head.length, key.length - tail.length),
    );
  }
  return null;
}

export type FileGrade = {
  /** Package imports the package does not export: an invented component or a deep path. */
  invented: string[];
  outsideUi: string[];
  /** Expectations no written file met, by their first option. */
  missed: string[];
  met: number;
  of: number;
};

/** `resolves(subpath)` says whether the installed package has the file an import of it loads. */
export function gradeFiles(
  files: Written[],
  resolves: (subpath: string) => boolean,
  expect: Expect[],
): FileGrade {
  const all = files.flatMap(specifiers);
  const own = all.filter((spec) => spec === PACKAGE || spec.startsWith(`${PACKAGE}/`));
  const invented = own.filter((spec) => !resolves(spec.slice(PACKAGE.length + 1)));
  const outsideUi = all.filter((spec) => OUTSIDE_UI.test(spec));
  const components = new Set(
    own.map(
      (spec) =>
        spec
          .split("/")
          .pop()
          ?.replace(/\.(astro|tsx?)$/, "") ?? "",
    ),
  );
  const classes = new Set(files.flatMap((file) => [...classesIn(code(file.text))]));
  const missed = expect
    .filter(
      (want) =>
        !(want.components ?? []).some((name) => components.has(name)) &&
        !(want.classes ?? []).some((name) => classes.has(name)),
    )
    .map((want) => (want.components ?? want.classes ?? [])[0] ?? "?");
  return {
    invented: [...new Set(invented)],
    outsideUi: [...new Set(outsideUi)],
    missed,
    met: expect.length - missed.length,
    of: expect.length,
  };
}

export type RunStats = {
  model: string;
  turns: number;
  tokens: number;
  toolCalls: number;
  /** Ran the package's `ds` lookup at least once. */
  usedDs: boolean;
  /** Opened the package's agent guide, foundations, llms files or a part page. */
  readGuide: boolean;
  finished: boolean;
};

type Block = { type?: string; name?: string; input?: Record<string, unknown> };
type Event = {
  type?: string;
  subtype?: string;
  model?: string;
  message?: { content?: Block[] };
  num_turns?: number;
  is_error?: boolean;
  usage?: Record<string, number>;
  // Antigravity CLI (`agy`) events name their type in `event` and carry a payload under that name.
  event?: string;
  init?: { model?: string };
  step_update?: {
    step_index?: number;
    step_type?: string;
    tool_info?: { name?: string; parameters?: Record<string, unknown> };
  };
  result?: { status?: string; num_turns?: number; usage?: Record<string, number> };
};

/** What one run did, read from either agent's stream before it is judged. */
type Trace = Omit<RunStats, "usedDs" | "readGuide"> & {
  commands: string[];
  /** Every path or command a tool was given, where a read of the guide would show. */
  touched: string[];
};

const sumTokens = (usage: Record<string, number>) =>
  Object.entries(usage)
    .filter(([key]) => key.endsWith("_tokens"))
    .reduce((sum, [, value]) => sum + (typeof value === "number" ? value : 0), 0);

/** `claude -p --output-format stream-json --verbose`. */
function claudeTrace(events: Event[]): Trace {
  const tools = events.flatMap((event) =>
    event.type === "assistant"
      ? (event.message?.content ?? []).filter((block) => block.type === "tool_use")
      : [],
  );
  const commands = tools
    .filter((tool) => tool.name === "Bash")
    .map((tool) => String(tool.input?.command ?? ""));
  const result = events.findLast((event) => event.type === "result");
  return {
    model: events.find((event) => event.subtype === "init")?.model ?? "",
    turns: result?.num_turns ?? 0,
    tokens: sumTokens(result?.usage ?? {}),
    toolCalls: tools.length,
    commands,
    touched: [
      ...tools.map((tool) => String(tool.input?.file_path ?? tool.input?.path ?? "")),
      ...commands,
    ],
    finished: result !== undefined && result.is_error !== true,
  };
}

/**
 * `agy --output-format stream-json`: a tool step is sent while it runs and again when done, so calls
 * are counted by step. Its `total_tokens` already holds the cache reads, which Claude Code's usage
 * counts apart, so the two totals measure the same thing.
 */
function antigravityTrace(events: Event[]): Trace {
  const steps = events.flatMap((event) =>
    event.event === "step_update" && event.step_update?.step_type === "tool"
      ? [event.step_update]
      : [],
  );
  const calls = steps.flatMap((step) => (step.tool_info ? [step.tool_info] : []));
  const commands = calls
    .filter((call) => call.name === "run_command")
    .map((call) => String(call.parameters?.CommandLine ?? ""));
  const result = events.findLast((event) => event.event === "result")?.result;
  return {
    // Reported only when `--model` set it; otherwise the CLI's default ran.
    model: events.find((event) => event.event === "init")?.init?.model ?? "agy default",
    turns: result?.num_turns ?? 0,
    tokens:
      result?.usage?.total_tokens ??
      (result?.usage?.input_tokens ?? 0) + (result?.usage?.output_tokens ?? 0),
    toolCalls: new Set(steps.map((step) => step.step_index)).size,
    commands,
    // Paths only, as for Claude Code: the text of a file it writes is not a read of the guide.
    touched: [
      ...calls.flatMap((call) =>
        Object.entries(call.parameters ?? {})
          .filter(([key]) => /(path|file|dir|directory|uri|url)$/i.test(key))
          .map(([, value]) => String(value)),
      ),
      ...commands,
    ],
    finished: result?.status === "SUCCESS",
  };
}

/**
 * Reads a run's stream-json, one JSON event per line. The caller names the agent: Claude Code's
 * partial-message events carry an `event` key too, so the shape alone does not tell them apart.
 */
export function runStats(transcript: string, agent: "claude" | "antigravity"): RunStats {
  const events: Event[] = transcript
    .split("\n")
    .filter((line) => line.startsWith("{"))
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as Event];
      } catch {
        return [];
      }
    });
  const { commands, touched, ...trace } =
    agent === "antigravity" ? antigravityTrace(events) : claudeTrace(events);
  return {
    ...trace,
    usedDs: commands.some((command) =>
      /(^|[\s;&|/])ds(\.mjs)?\s+(find|part|token|list|batch|validate|version)\b/.test(command),
    ),
    readGuide: touched.some((text) =>
      /design-system[\\/](AGENTS\.md|tokens[\\/](foundations\.md|llms|parts[\\/]))/.test(text),
    ),
  };
}

/** One row of a run's summary.json, as run.mjs writes it (snake_case). CI keeps only the counts of
 * `invented` and `outside_ui`, since their text is the agent's. */
export type SummaryRow = {
  setup: string;
  agent: string;
  task: string;
  model?: string;
  finished: boolean;
  met: number | null;
  of: number | null;
  invented: string[] | number | null;
  outside_ui: string[] | number | null;
  validate_errors: number | null;
  compiled: boolean | null;
  used_ds: boolean;
  read_guide: boolean;
  minutes: number | null;
  tokens: number | null;
};

/** Whether a list, or CI's count of it, is empty; null when CI could not read it. */
const none = (value: string[] | number | null) =>
  value === null ? null : (Array.isArray(value) ? value.length : value) === 0;

/** The pass or fail measures a change is counted on; null when a run could not tell. */
const MEASURES: [string, (row: SummaryRow) => boolean | null][] = [
  ["finished", (row) => row.finished],
  // null when a count did not read, so two missing counts never pass as equal.
  ["right part", (row) => (row.met === null || row.of === null ? null : row.met === row.of)],
  ["compiles", (row) => row.compiled],
  ["no invented import", (row) => none(row.invented)],
  ["no other UI library", (row) => none(row.outside_ui)],
  [
    "no `ds validate` error",
    (row) => (row.validate_errors === null ? null : row.validate_errors === 0),
  ],
  ["used `ds`", (row) => row.used_ds],
  ["read the guide", (row) => row.read_guide],
];

export type Change = {
  measure: string;
  /** Tasks that pass, in the run before and the last, among those both runs could judge. */
  before: number;
  after: number;
  /** Tasks that started passing, and that stopped. */
  up: number;
  down: number;
  /** Per direction: two or more tasks moved that way, or one did as a task did in the run before. */
  counts: { up: boolean; down: boolean };
};

export type Comparison = {
  setup: string;
  agent: string;
  /** How many of the given runs have this setup and agent; under 2, nothing is compared. */
  runs: number;
  /** Tasks every one of those runs has: the only ones counted. */
  shared: string[];
  /** Tasks some run has and another does not, so a task added later moves no count. */
  leftOut: string[];
  models: string[];
  changes: Change[];
  /** Medians over finished shared runs, before and after; read as information, never a verdict. Null
   * when no shared task finished. */
  minutes: [number | null, number | null];
  tokens: [number | null, number | null];
};

/** The middle value, or the mean of the two middle ones; null for none, so nothing reads as zero. */
export const median = (values: number[]): number | null => {
  const sorted = [...values].sort((a, b) => a - b);
  const half = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return null;
  return sorted.length % 2
    ? (sorted[half] ?? null)
    : ((sorted[half - 1] ?? 0) + (sorted[half] ?? 0)) / 2;
};

/**
 * Whether a run moved the agent test, against the one before it (DS-18 noise rule). With 8 tasks an
 * agent flips one by chance, so a one-task move counts only when the run before moved a task the same
 * way (pass three runs, oldest first); two or more tasks one way count at once. Moves up and down are
 * counted apart, so two that cancel still show. Each setup and agent is compared on the tasks its runs
 * share, over the runs that have it: a weekly run with one setup is skipped for the others.
 */
export function compareRuns(runs: SummaryRow[][]): Comparison[] {
  const last = runs.at(-1) ?? [];
  const keys = [...new Set(last.map((row) => `${row.setup}\u0000${row.agent}`))];
  return keys.map((key) => {
    const [setup = "", agent = ""] = key.split("\u0000");
    const mine = runs
      .map((run) => run.filter((row) => row.setup === setup && row.agent === agent))
      .filter((rows) => rows.length > 0);
    const ids = mine.map((rows) => new Set(rows.map((row) => row.task)));
    const all = [...new Set(mine.flat().map((row) => row.task))].sort();
    const shared = all.filter((task) => ids.every((set) => set.has(task)));
    const byTask = mine.map((rows) => new Map(rows.map((row) => [row.task, row])));
    const end = mine.length - 1;
    /** Each shared task's measure in run `from` and the next, where both could judge it. */
    const pairs = (measure: (row: SummaryRow) => boolean | null, from: number) =>
      shared.flatMap((task) => {
        const [a, b] = [byTask[from]?.get(task), byTask[from + 1]?.get(task)];
        const [was, now] = [a ? measure(a) : null, b ? measure(b) : null];
        return was === null || now === null ? [] : [[was, now] as const];
      });
    const changes =
      end < 1
        ? []
        : MEASURES.flatMap(([name, measure]): Change[] => {
            const judged = pairs(measure, end - 1);
            const up = judged.filter(([was, now]) => !was && now).length;
            const down = judged.filter(([was, now]) => was && !now).length;
            if (up === 0 && down === 0) return [];
            const earlier = end >= 2 ? pairs(measure, end - 2) : [];
            const upBefore = earlier.some(([was, now]) => !was && now);
            const downBefore = earlier.some(([was, now]) => was && !now);
            return [
              {
                measure: name,
                before: judged.filter(([was]) => was).length,
                after: judged.filter(([, now]) => now).length,
                up,
                down,
                counts: {
                  up: up >= 2 || (up === 1 && upBefore),
                  down: down >= 2 || (down === 1 && downBefore),
                },
              },
            ];
          });
    const finished = (at: number) =>
      shared.flatMap((task) => {
        const row = byTask[at]?.get(task);
        return row?.finished ? [row] : [];
      });
    const [was, now] = [finished(Math.max(end - 1, 0)), finished(end)];
    const middle = (rows: SummaryRow[], key: "minutes" | "tokens") =>
      median(rows.flatMap((row) => (row[key] === null ? [] : [row[key]])));
    return {
      setup,
      agent,
      runs: mine.length,
      shared,
      leftOut: all.filter((task) => !shared.includes(task)),
      models: [...new Set(mine.flat().flatMap((row) => (row.model ? [row.model] : [])))],
      changes,
      minutes: [middle(was, "minutes"), middle(now, "minutes")],
      tokens: [middle(was, "tokens"), middle(now, "tokens")],
    };
  });
}
