#!/usr/bin/env node
/**
 * Vercel Ignored Build Step helper.
 *
 * Exit 0 → skip the build (no app-relevant changes).
 * Exit 1 → continue the build.
 *
 * Hobby accounts are capped at 100 deployments / 24h. README/docs-only
 * commits and Dependabot preview noise burned that quota and left main
 * with a failing Vercel commit status. This script skips builds when the
 * diff does not touch install inputs or the Next app.
 */
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Paths whose changes require a Vercel build. */
export const RELEVANT_PATHS = [
  "apps/web",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  ".npmrc",
  "scripts",
];

/**
 * @param {{ cwd?: string, diffRange?: [string, string] }} [options]
 * @returns {boolean} true when the build should be skipped
 */
export function shouldSkipVercelBuild(options = {}) {
  const cwd = options.cwd ?? ROOT;
  const [from, to] = options.diffRange ?? ["HEAD^", "HEAD"];
  const result = spawnSync(
    "git",
    ["diff", "--quiet", from, to, "--", ...RELEVANT_PATHS],
    { cwd, stdio: "ignore" },
  );
  // git diff --quiet: 0 = no diff, 1 = diff present, other = error → build
  return result.status === 0;
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  process.exit(shouldSkipVercelBuild() ? 0 : 1);
}
