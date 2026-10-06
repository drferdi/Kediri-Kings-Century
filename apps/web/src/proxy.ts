import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ACCESS_USERNAME = "kediri";
const ACCESS_ITERATIONS = 310000;
const ACCESS_SALT_HEX = "b02d5566f0fef28fe372297b5fbee253";
const ACCESS_HASH_HEX =
  "27d146bb3c1d0d1935a466a4d3b350fbdfed924fc620b1a39a5ffb64791f1fc0";

function trustedOfficialRuntime(): boolean {
  return process.env.VERCEL === "1" || process.env.GITHUB_ACTIONS === "true";
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function hexBytes(value: string): Uint8Array {
  return Uint8Array.from(
    value.match(/.{2}/gu)?.map((byte) => Number.parseInt(byte, 16)) ?? [],
  );
}

async function passwordVerifierHex(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(value),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: hexBytes(ACCESS_SALT_HEX),
      iterations: ACCESS_ITERATIONS,
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function parseBasicAuthorization(
  authorization: string | null,
): { username: string; password: string } | undefined {
  if (!authorization?.startsWith("Basic ")) return undefined;

  try {
    const decoded = atob(authorization.slice("Basic ".length));
    const separator = decoded.indexOf(":");
    if (separator < 0) return undefined;

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return undefined;
  }
}

/**
 * Local-clone HTTP access gate.
 *
 * Official Vercel/GitHub automation is intentionally unaffected. A downloaded
 * clone running Next locally receives a browser-native Basic Auth challenge,
 * using the same repository password as scripts/repo-access.mjs.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (trustedOfficialRuntime()) return NextResponse.next();

  const localPassword = process.env.KEDIRI_REPO_PASSWORD;
  if (
    localPassword &&
    constantTimeEqual(await passwordVerifierHex(localPassword), ACCESS_HASH_HEX)
  ) {
    return NextResponse.next();
  }

  const credentials = parseBasicAuthorization(
    request.headers.get("authorization"),
  );

  if (
    credentials?.username === ACCESS_USERNAME &&
    constantTimeEqual(
      await passwordVerifierHex(credentials.password),
      ACCESS_HASH_HEX,
    )
  ) {
    return NextResponse.next();
  }

  return new NextResponse("Kediri repository access password required.", {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": 'Basic realm="Kediri History Local Clone", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
