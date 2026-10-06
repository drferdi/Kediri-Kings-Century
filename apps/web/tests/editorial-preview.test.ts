import { describe, expect, it } from "vitest";

import { editorialPreviewAllowed } from "../src/content/editorial-preview";

describe("editorial preview boundary", () => {
  it("keeps development preview-friendly without an explicit flag", () => {
    expect(editorialPreviewAllowed({ NODE_ENV: "development" })).toBe(true);
    expect(editorialPreviewAllowed({ NODE_ENV: "test" })).toBe(true);
  });

  it("keeps ordinary production closed", () => {
    expect(editorialPreviewAllowed({ NODE_ENV: "production" })).toBe(false);
  });

  it("allows an explicitly opted-in non-production Vercel preview", () => {
    expect(
      editorialPreviewAllowed({
        NODE_ENV: "production",
        SHOW_EDITORIAL_PREVIEW: "true",
        VERCEL_ENV: "preview",
      }),
    ).toBe(true);
  });

  it("never exposes editorial preview on Vercel Production", () => {
    expect(
      editorialPreviewAllowed({
        NODE_ENV: "production",
        SHOW_EDITORIAL_PREVIEW: "true",
        VERCEL_ENV: "production",
      }),
    ).toBe(false);
  });
});
