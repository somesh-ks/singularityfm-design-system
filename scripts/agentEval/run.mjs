// The agent test (DS-14, plan v2 step 3): give Claude Code each task in tasks.json, in up to three
// setups, and grade what it wrote with no model call. It runs on the owner's computer, on his own
// Claude sign-in (no API key), and keeps transcripts there; only the summary rows get committed.
//
//   node scripts/agentEval/run.mjs --app <path to singularityfm-app>   all three setups
//   node scripts/agentEval/run.mjs --setups bare-guide,bare            no app checkout needed
//
// Setups: `app` is the reader as it is (a worktree of its origin/main, its own AGENTS.md, hooks and
// project settings); `bare-guide` is a new Astro app with the package installed and the one line the
// package's guide asks an app to add; `bare` is the same app without that line.
// Options: --tasks id,id  --version <package version> (default: npm latest)  --model <name>
//   --timeout <minutes per task, default 15>  --user-settings (also load your own Claude settings and
//   plugins, to compare a run with them)  --out <folder> (default scripts/agentEval/runs, gitignored).
//
// Each task gets the same suffix: build it as a page at a named path, add no dependency. Grading reads
// the changed files: imports the package does not export, other UI libraries, the expected part, `ds
// validate` errors, and `astro check`; and the transcript: time, tokens, tool calls, whether `ds` ran
// and whether the package's guide was opened.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportTarget, gradeFiles, PACKAGE, runStats } from "./grade.ts";

const HERE = import.meta.dirname;
const WINDOWS = process.platform === "win32";
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : fallback;
};
const appPath = option("app");
const setups = option("setups", appPath ? "app,bare-guide,bare" : "bare-guide,bare").split(",");
const { tasks: allTasks } = JSON.parse(readFileSync(join(HERE, "tasks.json"), "utf8"));
const wanted = option("tasks");
const tasks = wanted ? allTasks.filter((task) => wanted.split(",").includes(task.id)) : allTasks;
const timeoutMinutes = Number(option("timeout", "15"));
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const out = join(option("out", join(HERE, "runs")), stamp);

// Windows starts `pnpm.cmd` and `claude.cmd` only through a shell. No command or argument here holds
// a quote, so quoting each one (the command too: Node's own path has a space in Program Files) is
// enough for cmd.
const quoted = (words) => (WINDOWS ? words.map((word) => `"${word}"`) : words);
function run(command, commandArgs, cwd, input) {
  const [program, ...rest] = quoted([command, ...commandArgs]);
  return execFileSync(program, rest, {
    cwd,
    encoding: "utf8",
    input,
    shell: WINDOWS,
    stdio: ["pipe", "pipe", "pipe"],
    maxBuffer: 256 * 1024 * 1024,
  });
}
const tryRun = (...call) => {
  try {
    return { ok: true, output: run(...call) };
  } catch (error) {
    return { ok: false, output: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
};
const git = (cwd, ...gitArgs) => run("git", gitArgs, cwd).trim();

const version = option("version") ?? run("npm", ["view", PACKAGE, "version"], HERE).trim();

/** Runs `make` in a new temp folder; removes the folder when it throws. */
function inTemp(prefix, make) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    return make(dir);
  } catch (error) {
    rmSync(dir, { recursive: true, force: true });
    throw error;
  }
}

/** A new Astro app with the package installed, committed so each task starts from the same tree. */
const bareApp = (withGuideLine) =>
  inTemp("ds-agent-", (dir) => {
    const peers = JSON.parse(
      run("npm", ["view", `${PACKAGE}@${version}`, "peerDependencies", "--json"], HERE),
    );
    mkdirSync(join(dir, "src/pages"), { recursive: true });
    mkdirSync(join(dir, "src/layouts"), { recursive: true });
    const write = (path, text) => writeFileSync(join(dir, path), text);
    write(
      "package.json",
      JSON.stringify(
        {
          name: "agent-test-app",
          private: true,
          type: "module",
          scripts: { check: "astro check" },
          dependencies: {
            ...peers,
            "@astrojs/react": "^7.1.4",
            "@astrojs/check": "^0.9.12",
            typescript: "~6.0.3",
            [PACKAGE]: version,
          },
        },
        null,
        2,
      ),
    );
    write(
      "astro.config.mjs",
      'import react from "@astrojs/react";\nexport default { integrations: [react()] };\n',
    );
    write(
      "tsconfig.json",
      JSON.stringify({
        extends: "astro/tsconfigs/strict",
        compilerOptions: { jsx: "react-jsx", allowImportingTsExtensions: true, noEmit: true },
      }),
    );
    write(
      "src/layouts/Base.astro",
      `---\nimport "${PACKAGE}/styles/tokens.css";\nimport "${PACKAGE}/styles/fonts.css";\nconst { title } = Astro.props;\n---\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>{title}</title>\n  </head>\n  <body>\n    <slot />\n  </body>\n</html>\n`,
    );
    write(
      "src/pages/index.astro",
      '---\nimport Base from "../layouts/Base.astro";\n---\n<Base title="Briefing"><main><h1>Briefing</h1></main></Base>\n',
    );
    write(
      "AGENTS.md",
      [
        "# Briefing",
        "",
        "An Astro app with React islands that reads a news briefing and plays its audio. Pages are in `src/pages`, the layout in `src/layouts/Base.astro`. Use pnpm.",
        ...(withGuideLine
          ? [
              "",
              "Before writing UI, read node_modules/@singularityfm/design-system/AGENTS.md and follow it.",
            ]
          : []),
        "",
      ].join("\n"),
    );
    write(".gitignore", "node_modules\ndist\n.astro\n");
    run("pnpm", ["install"], dir);
    git(dir, "init", "-q");
    git(dir, "add", "-A");
    git(
      dir,
      "-c",
      "user.name=agent-test",
      "-c",
      "user.email=agent-test@localhost",
      "commit",
      "-qm",
      "base",
    );
    return {
      dir,
      pages: "src/pages",
      root: dir,
      cleanup: () => rmSync(dir, { recursive: true, force: true }),
    };
  });

/** A worktree of the reader's origin/main, installed from the local pnpm store. */
function readerApp() {
  if (!appPath || !existsSync(join(appPath, ".git")))
    throw new Error("--app must be a singularityfm-app checkout");
  git(appPath, "fetch", "-q", "origin", "main");
  return inTemp("ds-agent-app-", (dir) => {
    const cleanup = () => {
      tryRun("git", ["worktree", "remove", "--force", dir], appPath);
      rmSync(dir, { recursive: true, force: true });
    };
    git(appPath, "worktree", "add", "-q", "--detach", dir, "origin/main");
    try {
      if (!tryRun("pnpm", ["install", "--frozen-lockfile", "--offline"], dir).ok)
        run("pnpm", ["install", "--frozen-lockfile"], dir);
    } catch (error) {
      cleanup();
      throw error;
    }
    return { dir, pages: "apps/web/src/pages", root: join(dir, "apps/web"), cleanup };
  });
}

/** One Claude Code run, prompt on stdin, transcript as stream-json; killed at the timeout. */
function claude(prompt, cwd) {
  const claudeArgs = [
    "-p",
    "--output-format",
    "stream-json",
    "--verbose",
    "--permission-mode",
    "acceptEdits",
  ];
  claudeArgs.push(
    "--allowedTools",
    "Read,Edit,Write,Glob,Grep,Bash(pnpm:*),Bash(npx:*),Bash(ls:*),Bash(cat:*)",
  );
  claudeArgs.push(
    "--setting-sources",
    args.includes("--user-settings") ? "user,project,local" : "project,local",
  );
  if (option("model")) claudeArgs.push("--model", option("model"));
  return new Promise((resolve) => {
    const [program, ...rest] = quoted(["claude", ...claudeArgs]);
    const child = spawn(program, rest, {
      cwd,
      shell: WINDOWS,
      // Its own process group on macOS and Linux, so the timeout reaches the tools it started too.
      detached: !WINDOWS,
      stdio: ["pipe", "pipe", "pipe"],
      // Auto memory would carry a note from one task into the next and skew the later scores.
      env: { ...process.env, CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1" },
    });
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(transcript);
    };
    let transcript = "";
    // Decoded as a stream, so a character split across two chunks survives; stderr is drained so a
    // chatty run cannot fill its pipe and stall.
    child.stdout.setEncoding("utf8");
    child.stderr.resume();
    child.stdout.on("data", (chunk) => {
      transcript += chunk;
    });
    const group = (signal) => {
      try {
        process.kill(-child.pid, signal);
      } catch {
        // The group has already exited.
      }
    };
    // A tool that keeps the pipes open would hold `close` back forever, so after a grace period
    // the group is killed and the run settles with what it wrote.
    const timer = setTimeout(() => {
      if (WINDOWS) tryRun("taskkill", ["/pid", String(child.pid), "/T", "/F"], cwd);
      else group("SIGTERM");
      setTimeout(() => {
        if (!WINDOWS && !settled) group("SIGKILL");
        settle();
      }, 10_000).unref();
    }, timeoutMinutes * 60_000);
    child.on("close", settle);
    child.stdin.end(prompt);
  });
}

/** Files the agent added or changed. `-z` keeps paths unquoted; a rename's old name follows it. */
function changedFiles(dir) {
  const entries = run("git", ["status", "--porcelain", "-z", "-uall"], dir).split("\0");
  const paths = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index] ?? "";
    if (entry.length < 4) continue;
    paths.push(entry.slice(3));
    if (/^[RC]/.test(entry)) index += 1;
  }
  return paths.filter(
    (path) => /\.(astro|tsx?|jsx?|css)$/.test(path) && existsSync(join(dir, path)),
  );
}

/** A record as written to disk: persisted keys are snake_case. */
const snake = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
      value,
    ]),
  );

const rows = [];
mkdirSync(out, { recursive: true });
for (const setup of setups) {
  const app = setup === "app" ? readerApp() : bareApp(setup === "bare-guide");
  try {
    const installed = join(app.root, "node_modules", PACKAGE);
    const { exports: exportsMap, version: installedVersion } = JSON.parse(
      readFileSync(join(installed, "package.json"), "utf8"),
    );
    const resolves = (subpath) => {
      const target = exportTarget(subpath, exportsMap);
      return target !== null && existsSync(join(installed, target));
    };
    const ds = join(installed, "bin/ds.mjs");
    // A tree that fails `astro check` before any task cannot say whether a task broke it.
    const checks = tryRun("pnpm", ["exec", "astro", "check"], app.root).ok;
    for (const task of tasks) {
      const page = `${app.pages}/eval/${task.id}.astro`;
      const prompt = `${task.prompt}\n\nBuild it as a page at ${page} in this project. Do not add dependencies.`;
      console.log(`${setup} / ${task.id} ...`);
      const started = Date.now();
      const transcript = await claude(prompt, app.dir);
      const minutes = Math.round((Date.now() - started) / 6000) / 10;
      mkdirSync(join(out, setup), { recursive: true });
      writeFileSync(join(out, setup, `${task.id}.jsonl`), transcript);
      const paths = changedFiles(app.dir);
      const files = paths.map((path) => ({
        path,
        text: readFileSync(join(app.dir, path), "utf8"),
      }));
      const grade = gradeFiles(files, resolves, task.expect);
      const validate = paths.length
        ? tryRun(
            process.execPath,
            [ds, "validate", "--json", ...paths.map((path) => join(app.dir, path))],
            app.root,
          )
        : { output: '{"errors":0}' };
      // null when `ds validate` gave no report, so a failed check never reads as a clean page.
      let validateErrors = null;
      try {
        validateErrors = JSON.parse(validate.output).errors;
      } catch {
        validateErrors = null;
      }
      const compiled = checks ? tryRun("pnpm", ["exec", "astro", "check"], app.root).ok : null;
      const row = {
        setup,
        task: task.id,
        // The reader app keeps the version its lockfile pins, which can differ from the others.
        package: installedVersion,
        ...runStats(transcript),
        minutes,
        ...grade,
        files: paths,
        validateErrors,
        compiled,
      };
      rows.push(row);
      writeFileSync(join(out, setup, `${task.id}.json`), JSON.stringify(snake(row), null, 2));
      git(app.dir, "reset", "-q", "--hard");
      git(app.dir, "clean", "-qfd");
    }
  } finally {
    app.cleanup();
  }
}

writeFileSync(join(out, "summary.json"), JSON.stringify({ rows: rows.map(snake) }, null, 2));
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;
const lines = [
  `${stamp}, model ${rows[0]?.model ?? "?"}. Medians are over finished runs; tokens count cache reads.`,
  "",
  "| Setup | Package | Finished | Right part | Invented imports | Other UI libraries | `ds validate` errors | Compiles | Used `ds` | Read the guide | Minutes (median) | Tokens (median) | Tool calls (median) |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
];
for (const setup of setups) {
  const mine = rows.filter((row) => row.setup === setup);
  const count = (pick) => mine.filter(pick).length;
  const sum = (pick) => mine.reduce((total, row) => total + pick(row), 0);
  const done = mine.filter((row) => row.finished);
  const errors = mine.some((row) => row.validateErrors === null)
    ? "?"
    : sum((row) => row.validateErrors);
  lines.push(
    `| ${setup} | ${mine[0]?.package ?? "?"} | ${done.length}/${mine.length} | ${count((row) => row.met === row.of)}/${mine.length} | ${sum((row) => row.invented.length)} | ${sum((row) => row.outsideUi.length)} | ${errors} | ${mine.some((row) => row.compiled === null) ? "n/a" : `${count((row) => row.compiled)}/${mine.length}`} | ${count((row) => row.usedDs)}/${mine.length} | ${count((row) => row.readGuide)}/${mine.length} | ${median(done.map((row) => row.minutes))} | ${median(done.map((row) => row.tokens))} | ${median(done.map((row) => row.toolCalls))} |`,
  );
}
writeFileSync(join(out, "summary.md"), `${lines.join("\n")}\n`);
console.log(`\n${lines.join("\n")}\n\nTranscripts and per-task grades: ${out}`);
