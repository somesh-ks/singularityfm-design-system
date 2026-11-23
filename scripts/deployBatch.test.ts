import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

// The batch skips a deploy on purpose, so a mistake in it fails silently: a fix that merged and
// never went live, or a deploy that still fires per merge. Each case is a push as Vercel sees it,
// run through the real script in a real repository.
const SCRIPT = join(import.meta.dirname, "deploy-batch.sh");
const roots: string[] = [];
const HOUR = 3_600_000;
// The clock is fixed: the script reads `date +%s`, which a stub first on PATH answers with NOW, and
// every commit is dated from NOW, so no case depends on how long the suite takes.
const NOW = 1_800_000_000_000;
const WIN_UNC_ENTRY = /^["']?(?:\\\\|\/\/)/;

function sanitizedPath(): string {
  const raw = process.env.PATH ?? "";
  if (process.platform !== "win32") return raw;
  return raw
    .split(delimiter)
    .filter((entry) => entry && !WIN_UNC_ENTRY.test(entry))
    .join(delimiter);
}

function envWithPath(pathValue: string, extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.toLowerCase() !== "path" && value !== undefined) env[key] = value;
  }
  let finalPath = pathValue;
  for (const [key, value] of Object.entries(extra)) {
    if (key.toLowerCase() === "path") finalPath = value;
    else env[key] = value;
  }
  env.PATH = finalPath;
  return env;
}

function toShPath(filePath: string): string {
  return process.platform === "win32"
    ? filePath
        .replace(/\\/g, "/")
        .replace(/^([A-Za-z]):/, (_, drive: string) => `/${drive.toLowerCase()}`)
    : filePath;
}

function git(root: string, args: string[], when = NOW): string {
  const date = new Date(when).toISOString();
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    env: envWithPath(sanitizedPath(), {
      GIT_AUTHOR_DATE: date,
      GIT_COMMITTER_DATE: date,
      GIT_AUTHOR_NAME: "t",
      GIT_AUTHOR_EMAIL: "t@example.com",
      GIT_COMMITTER_NAME: "t",
      GIT_COMMITTER_EMAIL: "t@example.com",
    }),
  }).trim();
}

function repo() {
  const root = mkdtempSync(join(tmpdir(), "deploy-batch-"));
  roots.push(root);
  mkdirSync(join(root, "scripts"), { recursive: true });
  writeFileSync(join(root, "scripts", "deploy-batch.sh"), "");
  git(root, ["init", "-q", "-b", "main"]);
  const stubs = join(root, ".stubs");
  mkdirSync(stubs);
  writeFileSync(join(stubs, "date"), `#!/bin/sh\necho ${NOW / 1000}\n`);
  chmodSync(join(stubs, "date"), 0o755);
  const stubsForSh = toShPath(stubs);
  const scriptForSh = toShPath(SCRIPT);
  const basePath = sanitizedPath();
  const commit = (file: string, message: string, when = NOW - 60_000) => {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), `${message}\n`);
    // The fixture's files are LF; a Windows machine's global autocrlf would print a warning per add.
    git(root, ["-c", "core.autocrlf=false", "add", "-A"]);
    git(root, ["commit", "-q", "-m", message], when);
  };
  commit("apps/web/page.ts", "first");
  const deployed = git(root, ["rev-parse", "HEAD"]);
  // What Vercel runs: from the project's root, with the last deployed commit named.
  // MSYS2 Git Bash prepends /mingw64/bin:/usr/bin ahead of an inherited Windows PATH on startup,
  // shadowing `.stubs/date` with `/usr/bin/date`, and re-exporting UNC entries in `$PATH` stalls
  // native child spawns (`git.exe`). Strip UNC entries, normalize `Path`/`PATH` casing, and
  // prepend the POSIX-form stub dir inside `sh` before sourcing the script.
  const push = (extra: Record<string, string> = {}) => {
    const result = spawnSync(
      "sh",
      [
        "-c",
        'PATH="$1:$PATH"; export PATH; shift; script="$1"; shift; . "$script"',
        "sh",
        stubsForSh,
        scriptForSh,
        "--",
        ".",
        "../../tokens",
      ],
      {
        cwd: join(root, "apps/web"),
        env: envWithPath(`${stubs}${delimiter}${basePath}`, {
          VERCEL_GIT_PREVIOUS_SHA: deployed,
          VERCEL_GIT_COMMIT_SHA: git(root, ["rev-parse", "HEAD"]),
          VERCEL_GIT_COMMIT_REF: "main",
          ...extra,
        }),
      },
    );
    if (result.error) throw result.error;
    return result.status;
  };
  return { root, commit, push, deployed };
}

// Node 26.7 divides `rmSync`'s `retryDelay` by 1000 before sleeping, so retry transient Windows locks explicitly.
const pause = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function removeDir(dir: string): void {
  for (let attempt = 1; ; attempt += 1) {
    try {
      rmSync(dir, { recursive: true, force: true });
      return;
    } catch (error) {
      const code = error instanceof Error && "code" in error ? String(error.code) : "";
      if (attempt === 6 || !["EPERM", "EBUSY", "ENOTEMPTY"].includes(code)) throw error;
      pause(attempt * 100);
    }
  }
}

afterEach(() => {
  for (const root of roots.splice(0)) removeDir(root);
});

describe("deploy-batch.sh", () => {
  // A deploy per merge was ~36 builds a day; waiting must not become waiting forever.
  it("holds code merges until five have landed, and content pushes neither count nor build", () => {
    const { commit, push } = repo();
    for (let n = 1; n <= 4; n += 1) {
      commit(`apps/web/m${n}.ts`, `fix: merge ${n}`);
      commit("state/last-run.json", `chore(digest): ${n}`);
      expect(push(), `after merge ${n}`).toBe(0);
    }
    commit("apps/web/m5.ts", "fix: merge 5");
    expect(push()).toBe(1);
  });

  it("a content push alone never builds", () => {
    const { commit, push } = repo();
    commit("state/last-run.json", "chore(digest): 1");
    commit("Digests/2026-11-05.md", "chore(audio): add narration");
    expect(push()).toBe(0);
  });

  // The owner waits to try a fix on his phone: the marker ships it with whatever is pending.
  it("builds at once when a subject since the last deploy ends with [deploy], even a docs-only one", () => {
    const { commit, push } = repo();
    commit("apps/web/fix.ts", "fix: the player");
    expect(push()).toBe(0);
    // A commit that only talks about the marker is not a request.
    commit("docs/runbook.md", "docs: explain the [deploy] marker");
    expect(push()).toBe(0);
    // GitHub's squash adds the PR number after the title.
    commit("docs/state.md", "docs: deploy now [deploy] (#718)");
    expect(push()).toBe(1);
  });

  it("the marker with nothing to ship does not build", () => {
    const { commit, push } = repo();
    commit("docs/state.md", "docs: note [deploy]");
    expect(push()).toBe(0);
  });

  // A lone fix would otherwise sit until four more merges, a quiet weekend included.
  it("builds a merge that has waited three hours, and holds one that has not", () => {
    const fresh = repo();
    fresh.commit("apps/web/a.ts", "fix: fresh", NOW - 10 * 60_000);
    expect(fresh.push()).toBe(0);
    const old = repo();
    old.commit("apps/web/a.ts", "fix: old", NOW - 4 * HOUR);
    old.commit("state/last-run.json", "chore(digest): later");
    expect(old.push()).toBe(1);
  });

  // Each is a case where skipping would hide a deploy that must run.
  it("builds when it cannot tell, on a redeploy, and on a preview branch", () => {
    const { commit, push, deployed } = repo();
    commit("apps/web/a.ts", "fix: one");
    expect(push({ VERCEL_GIT_PREVIOUS_SHA: "" })).toBe(1);
    expect(push({ VERCEL_GIT_PREVIOUS_SHA: "0".repeat(40) })).toBe(1);
    expect(push({ VERCEL_GIT_COMMIT_SHA: deployed })).toBe(1);
    expect(push({ VERCEL_GIT_COMMIT_REF: "preview/tryout" })).toBe(1);
    expect(push()).toBe(0);
  });
});
