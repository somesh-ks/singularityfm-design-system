#!/usr/bin/env bash
# The agent test's CI run (DS-16), inside the container agent-eval.yml starts: the repository is mounted
# read-only at /src and the results go to /out. Nothing from the runner is mounted and only one key is
# passed in, so an agent that runs any command can reach that key and this container, not the runner's
# tokens, cache or files.
set -euo pipefail

# The pin holds for every task: no self-update between the first and the last.
export DISABLE_AUTOUPDATER=1

cp -r /src /work
cd /work
# The repository's pnpm, also for the bare apps in /tmp, which name none.
corepack enable
corepack install -g "$(node -p "require('./package.json').packageManager")"
pnpm install --frozen-lockfile --ignore-scripts

# The version on main: right after a publish, `npm view`'s latest can still name the one before.
version=$(node -p "require('./packages/design-system/package.json').version")
found=""
for _ in $(seq 1 20); do
  if npm view "@singularityfm/design-system@$version" version >/dev/null 2>&1; then found=1; break; fi
  sleep 30
done
if [ -z "$found" ]; then
  echo "::error::@singularityfm/design-system@$version is not on npm after 10 minutes"
  exit 1
fi

extra=()
if [ "$AGENT" = claude ]; then
  # shortcut: pinned by version, not by lockfile hash; make it a devDependency if Dependabot should bump it.
  npm install -g @anthropic-ai/claude-code@2.1.319
  # A task stops at this spend, well above the few cents a Haiku task costs, under the monthly cap.
  extra=(--max-budget 0.5)
else
  # shortcut: the official installer has no version pin (it checks the download against its own
  # manifest's SHA-512); the summary's Model column says which model ran. Pin when it offers one.
  curl -fsSL https://antigravity.google/cli/install.sh | bash
  export PATH="$HOME/.local/bin:$PATH"
  # The key is only read once settings.json names the gemini provider.
  mkdir -p "$HOME/.gemini/antigravity-cli"
  echo '{ "modelProvider": "gemini" }' >"$HOME/.gemini/antigravity-cli/settings.json"
  if [ -n "${AGY_MODEL:-}" ]; then extra=(--agy-model "$AGY_MODEL"); fi
fi

node scripts/agentEval/run.mjs --setups bare-guide,bare --agents "$AGENT" --version "$version" \
  --timeout 15 --out /out "${extra[@]}"
