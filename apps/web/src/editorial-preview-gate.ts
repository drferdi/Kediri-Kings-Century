import { SITE_URL } from "./site";

const CANONICAL_PUBLIC_ORIGIN = "https://kediri.sentrahai.com";

/**
 * Pratinjau editorial (naskah produksi penuh + media `/api/editorial-preview/`)
 * hanya untuk pengembangan lokal atau deployment non-kanonis dengan saklar eksplisit.
 * Deployment publik di `kediri.sentrahai.com` tidak pernah mengekspos draft,
 * meskipun hosting masih menyetel `SHOW_EDITORIAL_PREVIEW=true`.
 */
export function editorialPreviewEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  if (process.env.SHOW_EDITORIAL_PREVIEW !== "true") {
    return false;
  }
  return SITE_URL.replace(/\/$/u, "") !== CANONICAL_PUBLIC_ORIGIN;
}
