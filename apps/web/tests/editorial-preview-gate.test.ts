import { afterEach, describe, expect, it, vi } from "vitest";

describe("editorialPreviewEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("enables preview in non-production builds", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { editorialPreviewEnabled } = await import(
      "../src/editorial-preview-gate"
    );
    expect(editorialPreviewEnabled()).toBe(true);
  });

  it("disables preview on canonical production even when the flag is set", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SHOW_EDITORIAL_PREVIEW", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://kediri.sentrahai.com");
    const { editorialPreviewEnabled } = await import(
      "../src/editorial-preview-gate"
    );
    expect(editorialPreviewEnabled()).toBe(false);
  });

  it("allows preview on non-canonical production when the flag is set", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SHOW_EDITORIAL_PREVIEW", "true");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example.com");
    const { editorialPreviewEnabled } = await import(
      "../src/editorial-preview-gate"
    );
    expect(editorialPreviewEnabled()).toBe(true);
  });
});
