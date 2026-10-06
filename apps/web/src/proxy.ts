import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ACCESS_USERNAME = "kediri";
const PASSWORD_SHA256 =
  "eb718e98ac8323378995301619e0808294c4c42ee56924ecf6f356e097c63728";

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

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
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
    constantTimeEqual(await sha256Hex(localPassword), PASSWORD_SHA256)
  ) {
    return NextResponse.next();
  }

  const credentials = parseBasicAuthorization(
    request.headers.get("authorization"),
  );

  if (
    credentials?.username === ACCESS_USERNAME &&
    constantTimeEqual(
      await sha256Hex(credentials.password),
      PASSWORD_SHA256,
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
