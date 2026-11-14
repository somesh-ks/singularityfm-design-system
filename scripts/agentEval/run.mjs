// The agent test (DS-14, DS-15, plan v2 step 3): give a coding agent each task in tasks.json, in up
// to three setups, and grade what it wrote with no model call. It runs on the owner's computer, on his
// own sign-ins, and keeps transcripts there; only the summary rows get committed. agent-eval.yml also
// runs the bare setups in CI (the guide one weekly, both after a publish; DS-18), inside a container, in
// spend-capped accounts: Claude Code with no key (DS-17), Antigravity on a Gemini key (DS-16).
// compare.mjs says whether two runs differ by more than chance.
//
//   node scripts/agentEval/run.mjs --app <path to singularityfm-app>   all three setups
//   node scripts/agentEval/run.mjs --setups bare-guide,bare            no app checkout needed
//   node scripts/agentEval/run.mjs --app <path> --agents claude,antigravity   both agents, same setups
//
// Setups: `app` is the reader as it is (a worktree of its origin/main, its own AGENTS.md, hooks and
// project settings); `bare-guide` is a new Astro app with the package installed and the one line the
// package's guide asks an app to add; `bare` is the same app without that line.
// Agents: `claude` (Claude Code, the default) and `antigravity` (the Antigravity CLI, `agy`). Both read
// the setup's AGENTS.md. Claude Code may edit files and run read/build inspection commands (pnpm,
// npx, ds, node, cd, ls, cat, head, tail, grep, rg, find, sed, awk, tr, cut, wc, sort, uniq, diff,
// echo, printf, test, timeout, mkdir, pwd, which, basename, dirname, git) with network fetch and
// git remote mutations blocked; `agy` has no such list outside its global settings, so it runs
// with every tool approved inside its terminal sandbox.
// Options: --agents claude,antigravity  --tasks id,id  --version <package version> (default: npm
//   latest)  --local (pack local packages/design-system instead of npm)  --tarball <path to .tgz>
//   --model <Claude model, default claude-haiku-5-5>  --agy-model <Antigravity model,
//   default its own>  --timeout <minutes per task, default 15>
//   --user-settings (Claude Code only: also load your own settings and plugins, to compare a run with
//   them)  --max-budget <dollars> (Claude Code only: a task stops at that spend; CI sets it)
//   --out <folder> (default scripts/agentEval/runs, gitignored).
//
// Each task gets the same suffix: build it as a page at a named path, add no dependency. Grading reads
// the changed files: imports the package does not export, other UI libraries, the expected part, `ds
// validate` errors, and `astro check`; and the transcript: time, tokens, tool calls, whether `ds` ran
// and whether the package's guide was opened.
import { execFileSync, spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  exportTarget,
  formatSummaryMarkdown,
  gradeFiles,
  PACKAGE,
  readTarballPackageJson,
  runStats,
} from "./grade.ts";

const HERE = import.meta.dirname;
const DS_PACKAGE_DIR = resolve(HERE, "../../packages/design-system");
const WINDOWS = process.platform === "win32";
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  if (at < 0) return fallback;
  const value = args[at + 1];
  if (!value || value.startsWith("--")) throw new Error(`--${name} requires a value`);
  return value;
};
const appPath = option("app");
const setups = option("setups", appPath ? "app,bare-guide,bare" : "bare-guide,bare").split(",");
const { tasks: allTasks } = JSON.parse(readFileSync(join(HERE, "tasks.json"), "utf8"));
const wanted = option("tasks");
const tasks = wanted ? allTasks.filter((task) => wanted.split(",").includes(task.id)) : allTasks;
const timeoutMinutes = Number(option("timeout", "15"));
const AGENTS = ["claude", "antigravity"];
const agents = option("agents", "claude").split(",");
const unknown = agents.filter((agent) => !AGENTS.includes(agent));
if (unknown.length)
  throw new Error(`--agents takes ${AGENTS.join(", ")}; not ${unknown.join(", ")}`);
const useLocal = args.includes("--local");
const tarballArg = option("tarball");
const versionArg = option("version");
if (Number(useLocal) + Number(Boolean(tarballArg)) + Number(Boolean(versionArg)) > 1) {
  throw new Error("Pass only one of --local, --tarball, or --version");
}
const needsBare = setups.some((setup) => setup !== "app");
if (!needsBare && (useLocal || tarballArg || versionArg)) {
  throw new Error("--local, --tarball, and --version only apply when running bare setups");
}
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const out = join(option("out", join(HERE, "runs")), stamp);

// Windows starts `pnpm.cmd`, `claude.cmd` and `agy.cmd` only through a shell. Every argument is
// quoted (none here holds a quote). A command is quoted only when it holds a space (Node's own path in
// Program Files): cmd runs a quoted bare name such as "npm" with `%~dp0` inside npm.cmd pointing at
// the working folder, not at Node's, and npm then fails to find itself (owner's run, 2026-11-13).
const quoted = (words) =>
  WINDOWS ? words.map((word, index) => (index > 0 || /\s/.test(word) ? `"${word}"` : word)) : words;
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

const readTarballSource = (tgzPath) => {
  const meta = readTarballPackageJson(readFileSync(tgzPath));
  if (meta.name && meta.name !== PACKAGE) {
    throw new Error(`Expected tarball for ${PACKAGE}, got ${meta.name}`);
  }
  return {
    spec: `file:${tgzPath.replace(/\\/g, "/")}`,
    peers: meta.peerDependencies ?? {},
  };
};

/**
 * Removes a temp folder. Windows can hold a file open for a moment after its process exits (EPERM,
 * EBUSY; owner's run, 2026-11-14), so it retries with a real pause: `rmSync`'s own `retryDelay` is
 * divided by 1000 before a millisecond Sleep in some Node releases (24.0.0, 26.7.0), so it barely
 * waits. A folder that still will not go is left with a warning instead of ending the run.
 */
const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
function removeDir(dir) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      rmSync(dir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 6 || !["EPERM", "EBUSY", "ENOTEMPTY"].includes(error.code)) {
        console.warn(
          `Could not remove ${dir} (${error.code ?? error.message}); delete it by hand.`,
        );
        return;
      }
      pause(attempt * 500);
    }
  }
}

/** Runs `make` in a new temp folder; removes the folder when it throws. */
function inTemp(prefix, make) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    return make(dir);
  } catch (error) {
    removeDir(dir);
    throw error;
  }
}

/** A new Astro app with the package installed, committed so each task starts from the same tree. */
const bareApp = (withGuideLine, source) =>
  inTemp("ds-agent-", (dir) => {
    const peers = source.peers;
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
            "@types/react": peers["@types/react"] ?? "^19.3.0",
            "@types/react-dom": peers["@types/react-dom"] ?? "^19.3.0",
            typescript: "~6.0.3",
            [PACKAGE]: source.spec,
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
      cleanup: () => removeDir(dir),
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
      removeDir(dir);
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

/** The command line for one run of an agent and what goes on its stdin. */
function agentCall(agent, prompt) {
  if (agent === "antigravity") {
    // The prompt goes in as a stream-json `user` event, so no shell quoting touches it; closing stdin
    // after it ends the session once the turn is done. Every tool is approved, so it runs in the
    // terminal sandbox (workspace and temp folders, no network) where the platform has one; `agy`
    // runs without it where it has none, and the push block in runAgent is what stays.
    const call = [
      "agy",
      "--input-format",
      "stream-json",
      "--output-format",
      "stream-json",
      "--dangerously-skip-permissions",
      "--sandbox",
    ];
    if (option("agy-model")) call.push("--model", option("agy-model"));
    return { call, input: `${JSON.stringify({ event: "user", message: { content: prompt } })}\n` };
  }
  const call = [
    "claude",
    "-p",
    "--output-format",
    "stream-json",
    "--verbose",
    "--permission-mode",
    "acceptEdits",
  ];
  call.push(
    "--allowedTools",
    [
      "Read",
      "Edit",
      "Write",
      "Glob",
      "Grep",
      "Bash(pnpm:*)",
      "Bash(npx:*)",
      "Bash(ds:*)",
      "Bash(node:*)",
      "Bash(cd:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(grep:*)",
      "Bash(rg:*)",
      "Bash(find:*)",
      "Bash(sed:*)",
      "Bash(awk:*)",
      "Bash(tr:*)",
      "Bash(cut:*)",
      "Bash(wc:*)",
      "Bash(sort:*)",
      "Bash(uniq:*)",
      "Bash(diff:*)",
      "Bash(echo:*)",
      "Bash(printf:*)",
      "Bash(test:*)",
      "Bash(timeout:*)",
      "Bash(mkdir:*)",
      "Bash(pwd:*)",
      "Bash(which:*)",
      "Bash(basename:*)",
      "Bash(dirname:*)",
      "Bash(git:*)",
    ].join(","),
    "--disallowedTools",
    [
      "WebFetch",
      "WebSearch",
      "Bash(git push:*)",
      "Bash(git * push *)",
      "Bash(git remote:*)",
      "Bash(git * remote *)",
      "Bash(git fetch:*)",
      "Bash(git * fetch *)",
      "Bash(git pull:*)",
      "Bash(git * pull *)",
      "Bash(git clone:*)",
      "Bash(curl:*)",
      "Bash(wget:*)",
      "Bash(ssh:*)",
      "Bash(scp:*)",
    ].join(","),
  );
  call.push(
    "--setting-sources",
    args.includes("--user-settings") ? "user,project,local" : "project,local",
  );
  // Pinned, so a baseline and a later run use the same model whatever the CLI's own default is, and
  // the small one, so a full run costs little and the docs carry more of the result (owner, 2026-11-13).
  call.push("--model", option("model", "claude-haiku-5-5"));
  if (option("max-budget")) call.push("--max-budget-usd", option("max-budget"));
  return { call, input: prompt };
}

/** One agent run, its transcript as stream-json and its stderr; killed at the timeout. */
function runAgent(agent, prompt, cwd) {
  const { call, input } = agentCall(agent, prompt);
  return new Promise((resolve) => {
    const [program, ...rest] = quoted(call);
    const child = spawn(program, rest, {
      cwd,
      shell: WINDOWS,
      // Its own process group on macOS and Linux, so the timeout reaches the tools it started too.
      detached: !WINDOWS,
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        // Auto memory would carry a note from one task into the next and skew the later scores.
        CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1",
        // A push from the reader's worktree would reach the owner's real repository; git reads this
        // for every command the agent starts, and the owner's own git config is left as it is.
        GIT_CONFIG_COUNT: "1",
        GIT_CONFIG_KEY_0: "remote.origin.pushurl",
        GIT_CONFIG_VALUE_0: "agent-test-no-push",
      },
    });
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ transcript, errors });
    };
    let transcript = "";
    let errors = "";
    // Decoded as a stream, so a character split across two chunks survives; stderr is read as it
    // comes, so a chatty run cannot fill its pipe and stall, and kept, so a failed sign-in or a
    // refused tool is on record.
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      transcript += chunk;
    });
    child.stderr.on("data", (chunk) => {
      errors += chunk;
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
    // A missing `agy` or `claude`, or one that exits before reading its prompt, ends this run with
    // the reason on record instead of stopping the whole test with the worktree left behind.
    child.on("error", (error) => {
      errors += `${error.message}\n`;
      settle();
    });
    child.stdin.on("error", (error) => {
      errors += `${error.message}\n`;
    });
    child.stdin.end(input);
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

let packDir = null;
const cleanupPack = () => {
  if (packDir) {
    removeDir(packDir);
    packDir = null;
  }
};
let packageSource = null;
if (needsBare) {
  if (useLocal) {
    packDir = mkdtempSync(join(tmpdir(), "ds-eval-pack-"));
    try {
      run("pnpm", ["pack", "--pack-destination", packDir], DS_PACKAGE_DIR);
      const tgz = readdirSync(packDir).find((file) => file.endsWith(".tgz"));
      if (!tgz) throw new Error(`pnpm pack wrote no .tgz in ${packDir}`);
      packageSource = readTarballSource(join(packDir, tgz));
    } catch (error) {
      cleanupPack();
      throw error;
    }
  } else if (tarballArg) {
    const tarballPath = resolve(tarballArg);
    if (!existsSync(tarballPath)) throw new Error(`Tarball not found: ${tarballPath}`);
    packageSource = readTarballSource(tarballPath);
  } else {
    const version = versionArg ?? run("npm", ["view", PACKAGE, "version"], HERE).trim();
    // npm 12 answers a `view <name>@<version> <field> --json` with a one-item array; older npm with
    // the object itself.
    const viewed = JSON.parse(
      run("npm", ["view", `${PACKAGE}@${version}`, "peerDependencies", "--json"], HERE),
    );
    packageSource = {
      spec: version,
      peers: Array.isArray(viewed) ? (viewed[0] ?? {}) : viewed,
    };
  }
}

const rows = [];
mkdirSync(out, { recursive: true });
// The summary is written in `finally`, so a setup that throws hours in keeps the rows before it.
try {
  for (const setup of setups) {
    const app = setup === "app" ? readerApp() : bareApp(setup === "bare-guide", packageSource);
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
      for (const [agent, task] of agents.flatMap((agent) => tasks.map((task) => [agent, task]))) {
        const page = `${app.pages}/eval/${task.id}.astro`;
        const prompt = `${task.prompt}\n\nBuild it as a page at ${page} in this project. Do not add dependencies.`;
        console.log(`${setup} / ${agent} / ${task.id} ...`);
        const started = Date.now();
        const { transcript, errors } = await runAgent(agent, prompt, app.dir);
        const minutes = Math.round((Date.now() - started) / 6000) / 10;
        const folder = join(out, setup, agent);
        mkdirSync(folder, { recursive: true });
        writeFileSync(join(folder, `${task.id}.jsonl`), transcript);
        if (errors) writeFileSync(join(folder, `${task.id}.stderr.txt`), errors);
        if (!transcript.trim())
          console.log(
            `  ${agent} wrote no transcript; its stderr is beside the others in ${folder}`,
          );
        const stats = runStats(transcript, agent);
        const paths = changedFiles(app.dir);
        let grade = {
          met: null,
          of: null,
          invented: null,
          outsideUi: null,
          missed: [],
        };
        let validateErrors = null;
        let compiled = null;
        if (stats.finished) {
          const files = paths.map((path) => ({
            path,
            text: readFileSync(join(app.dir, path), "utf8"),
          }));
          grade = gradeFiles(files, resolves, task.expect);
          const validate = paths.length
            ? tryRun(
                process.execPath,
                [ds, "validate", "--json", ...paths.map((path) => join(app.dir, path))],
                app.root,
              )
            : { output: '{"errors":0}' };
          // null when `ds validate` gave no report, so a failed check never reads as a clean page.
          try {
            validateErrors = JSON.parse(validate.output).errors;
          } catch {
            validateErrors = null;
          }
          // An agent that exited cleanly without writing any UI file did not compile a solution.
          compiled = checks
            ? paths.length > 0 && tryRun("pnpm", ["exec", "astro", "check"], app.root).ok
            : null;
        }
        const row = {
          setup,
          agent,
          task: task.id,
          // The reader app keeps the version its lockfile pins, which can differ from the others.
          package: installedVersion,
          ...stats,
          minutes,
          ...grade,
          files: paths,
          validateErrors,
          compiled,
        };
        rows.push(row);
        writeFileSync(join(folder, `${task.id}.json`), JSON.stringify(snake(row), null, 2));
        git(app.dir, "reset", "-q", "--hard");
        git(app.dir, "clean", "-qfd");
      }
    } finally {
      app.cleanup();
    }
  }
} finally {
  cleanupPack();
  const summaryRows = rows.map(snake);
  writeFileSync(join(out, "summary.json"), JSON.stringify({ rows: summaryRows }, null, 2));
  const markdown = formatSummaryMarkdown(
    summaryRows,
    setups.flatMap((setup) => agents.map((agent) => [setup, agent])),
    stamp,
  );
  writeFileSync(join(out, "summary.md"), markdown);
  console.log(`\n${markdown}\nTranscripts and per-task grades: ${out}`);
}
