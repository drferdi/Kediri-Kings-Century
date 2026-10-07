import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { RELEVANT_PATHS, shouldSkipVercelBuild } from "./vercel-ignore.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("RELEVANT_PATHS covers the Next app and install inputs", () => {
  assert.ok(RELEVANT_PATHS.includes("apps/web"));
  assert.ok(RELEVANT_PATHS.includes("pnpm-lock.yaml"));
  assert.ok(RELEVANT_PATHS.includes("scripts"));
});

test("docs-only commit is skipped", () => {
  // 3aa262d — docs(readme): use renderer-native compact table text
  assert.equal(
    shouldSkipVercelBuild({
      cwd: ROOT,
      diffRange: ["3aa262d^", "3aa262d"],
    }),
    true,
  );
});

test("dependency restore commit is not skipped", () => {
  // 2dbbd69 — fix(deps): restore last known-good Vercel dependency set
  assert.equal(
    shouldSkipVercelBuild({
      cwd: ROOT,
      diffRange: ["2dbbd69^", "2dbbd69"],
    }),
    false,
  );
});
