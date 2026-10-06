#!/usr/bin/env node
/**
 * Local repository execution gate.
 *
 * This is a deterrence/access-control layer for standard install and run
 * workflows after a clone or ZIP download. It is not DRM: someone who already
 * possesses the source can modify or remove this file. Preventing source
 * download requires repository-level access control (for example a private
 * GitHub repository).
 *
 * The real password is never stored in Git. Only a PBKDF2-SHA256 verifier is
 * committed. Official GitHub Actions and Vercel automation bypass the local
 * prompt so CI/deployments remain non-interactive.
 */
import { existsSync } from "node:fs";
import { pbkdf2Sync, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));

export const ACCESS_POLICY = Object.freeze({
  algorithm: "pbkdf2-sha256",
  iterations: 310000,
  saltHex: "073ec5dc8c2e0e16312cb00faf942a6e",
  hashHex: "ce1bda8307c274a60bca4997b63ebdf259e25e3ac83e16bccbdc3acf4c511d23",
});

export function deriveRepositoryPasswordHash(password, policy = ACCESS_POLICY) {
  return pbkdf2Sync(
    password,
    Buffer.from(policy.saltHex, "hex"),
    policy.iterations,
    32,
    "sha256",
  );
}

export function verifyRepositoryPassword(password, policy = ACCESS_POLICY) {
  if (typeof password !== "string" || password.length === 0) return false;

  const actual = deriveRepositoryPasswordHash(password, policy);
  const expected = Buffer.from(policy.hashHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function isTrustedAutomation(environment = process.env) {
  return (
    environment.GITHUB_ACTIONS === "true" ||
    environment.VERCEL === "1"
  );
}

function loadLocalEnvironment() {
  const candidates = [
    path.join(ROOT, ".env.local"),
    path.join(ROOT, "apps", "web", ".env.local"),
  ];

  for (const filename of candidates) {
    if (!existsSync(filename)) continue;
    try {
      process.loadEnvFile(filename);
    } catch (error) {
      console.error(
        `[Kediri access] Could not read ${path.relative(ROOT, filename)}: ${String(error)}`,
      );
      process.exit(1);
    }
  }
}

function readHiddenPassword(label) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      resolve("");
      return;
    }

    const input = process.stdin;
    const output = process.stdout;
    const previousRaw = input.isRaw;
    let value = "";

    const cleanup = () => {
      input.off("data", onData);
      if (typeof input.setRawMode === "function") {
        input.setRawMode(Boolean(previousRaw));
      }
      input.pause();
    };

    const onData = (chunk) => {
      for (const char of String(chunk)) {
        if (char === "\u0003") {
          cleanup();
          output.write("\n");
          process.exit(130);
        }

        if (char === "\r" || char === "\n") {
          cleanup();
          output.write("\n");
          resolve(value);
          return;
        }

        if (char === "\u007f" || char === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            output.write("\b \b");
          }
          continue;
        }

        value += char;
        output.write("*");
      }
    };

    output.write(label);
    input.setEncoding("utf8");
    if (typeof input.setRawMode === "function") input.setRawMode(true);
    input.resume();
    input.on("data", onData);
  });
}

export async function requireRepositoryAccess() {
  if (isTrustedAutomation()) return;

  loadLocalEnvironment();

  const supplied =
    process.env.KEDIRI_REPO_PASSWORD ??
    (await readHiddenPassword("Kediri repository password: "));

  if (!supplied) {
    console.error(
      "[Kediri access] Password required. Set KEDIRI_REPO_PASSWORD in an untracked .env.local or run interactively.",
    );
    process.exit(1);
  }

  if (!verifyRepositoryPassword(supplied)) {
    console.error("[Kediri access] Access denied: invalid password.");
    process.exit(1);
  }
}

const invokedUrl = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : undefined;

if (invokedUrl === import.meta.url) {
  await requireRepositoryAccess();
}
