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
