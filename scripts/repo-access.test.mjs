import assert from "node:assert/strict";
import { pbkdf2Sync } from "node:crypto";
import test from "node:test";

import {
  deriveRepositoryPasswordHash,
  isTrustedAutomation,
  verifyRepositoryPassword,
} from "./repo-access.mjs";

test("repository password verification uses PBKDF2-SHA256 without plaintext", () => {
  const password = "unit-test-secret";
  const policy = {
    algorithm: "pbkdf2-sha256",
    iterations: 1000,
    saltHex: "00112233445566778899aabbccddeeff",
    hashHex: pbkdf2Sync(
      password,
      Buffer.from("00112233445566778899aabbccddeeff", "hex"),
      1000,
      32,
      "sha256",
    ).toString("hex"),
  };

  assert.equal(verifyRepositoryPassword(password, policy), true);
  assert.equal(verifyRepositoryPassword("wrong-secret", policy), false);
  assert.equal(
    deriveRepositoryPasswordHash(password, policy).toString("hex"),
    policy.hashHex,
  );
});

test("only official non-interactive automation bypasses the local prompt", () => {
  assert.equal(isTrustedAutomation({ GITHUB_ACTIONS: "true" }), true);
  assert.equal(isTrustedAutomation({ VERCEL: "1" }), true);
  assert.equal(isTrustedAutomation({}), false);
  assert.equal(isTrustedAutomation({ CI: "true" }), false);
});
