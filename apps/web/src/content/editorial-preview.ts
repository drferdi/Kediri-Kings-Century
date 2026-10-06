/**
 * Single source of truth for the editorial-preview boundary.
 *
 * Development remains preview-friendly. A production process requires the
 * explicit SHOW_EDITORIAL_PREVIEW switch, but Vercel Production ignores that
 * switch defensively so a stale deployment variable cannot expose editorial
 * assets on the public production domain. Vercel Preview deployments may still
 * opt in explicitly.
 */
export interface EditorialPreviewEnvironment {
  readonly NODE_ENV?: string;
  readonly SHOW_EDITORIAL_PREVIEW?: string;
  readonly VERCEL_ENV?: string;
}

export function editorialPreviewAllowed(
  environment: EditorialPreviewEnvironment = process.env,
): boolean {
  if (environment.NODE_ENV !== "production") return true;
  if (environment.SHOW_EDITORIAL_PREVIEW !== "true") return false;

  return environment.VERCEL_ENV !== "production";
}
