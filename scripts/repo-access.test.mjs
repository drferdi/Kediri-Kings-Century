import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  ACCESS_POLICY,
  deriveRepositoryPasswordHash,
  isTrustedAutomation,
  verifyRepositoryPassword,
} from "./repo-access.mjs";

test("repository password verification uses SHA-256 without plaintext", () => {
  const password = "unit-test-secret";
  const policy = {
    algorithm: "sha256",
    hashHex: createHash("sha256").update(password, "utf8").digest("hex"),
  };

  assert.equal(verifyRepositoryPassword(password, policy), true);
  assert.equal(verifyRepositoryPassword("wrong-secret", policy), false);
  assert.equal(
    deriveRepositoryPasswordHash(password).toString("hex"),
    policy.hashHex,
  );
});

test("only official non-interactive automation bypasses the local prompt", () => {
  assert.equal(isTrustedAutomation({ GITHUB_ACTIONS: "true" }), true);
  assert.equal(isTrustedAutomation({ VERCEL: "1" }), true);
  assert.equal(isTrustedAutomation({}), false);
  assert.equal(isTrustedAutomation({ CI: "true" }), false);
});

test("CLI and Next proxy share one committed verifier policy", async () => {
  const proxyPath = fileURLToPath(
    new URL("../apps/web/src/proxy.ts", import.meta.url),
  );
  const proxy = await readFile(proxyPath, "utf8");

  assert.match(proxy, new RegExp(ACCESS_POLICY.hashHex, "u"));
  assert.match(proxy, /SHA-256/u);
});
