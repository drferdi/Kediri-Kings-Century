# Testing and verification

This capsule separates **fast offline checks** (Vitest, token script), **dev-server browser evidence** (Playwright), and **production-shaped motion evidence** (webpack build + production boot). Commands below run from the **capsule root** unless noted.

## Command map

| Command | Layer | What it proves |
| --- | --- | --- |
| `pnpm run test` | Node (`scripts/repo-access.test.mjs`) + Vitest (`@kediri/web`) + `scripts/check-tokens.mjs` | Repo access gate contract, module tests (see below), design-token snapshot |
| `pnpm run test:e2e` | Playwright (`playwright.config.ts`) | Journey/archive UX contracts on **Next dev** (desktop + mobile); excludes `production-motion.spec.ts` |
| `pnpm run test:e2e:production:built` | Playwright (`playwright.production.config.ts`) | Journey **production boot**: GSAP/ScrollTrigger readiness, scroll response, reduced-motion behavior, no editorial-preview leakage |
| `pnpm run test:e2e:production` | Orchestrator (`scripts/run-production-motion.mjs`) | Full local pipeline: production build → journey HTML boundary → `test:e2e:production:built` |
| `pnpm run verify:production` | Payload CLI | Historical-integrity verification against seeded/reviewed CMS data (requires DB) |
| `pnpm run verify` | Composite | lint → typecheck → test → build → journey boundary → `verify:production` |

CI contract (when enabled): `.github/workflows/ci.yml`. Production motion canary: `.github/workflows/production-motion-canary.yml` sets `KEDIRI_MOTION_CANARY_URL` and runs `@kediri/web` `e2e:production:built` (Playwright only — no local `check-production-journey.mjs`). Automatic runs fire on successful `deployment_status` events only when the Vercel deployment environment starts with `Production`; `workflow_dispatch` remains for explicit manual checks. Preview deployments therefore do not trigger the canary.

## Where tests live

| Path | Role |
| --- | --- |
| `apps/web/tests/` | Vitest unit and contract tests |
| `apps/web/vitest.config.ts` | Vitest runner: `environment: "node"`, `include: tests/**/*.test.ts`, excludes `e2e/**` (Playwright-owned) |
| `apps/web/e2e/` | Playwright specs |
| `scripts/repo-access.test.mjs` | Capsule repo-access preinstall gate (runs before Vitest in root `pnpm test`) |
| `tests/` | Topology placeholder only; executable tests are **not** duplicated here (`tests/README.md` points here) |
| `scripts/check-tokens.mjs` | Capsule token snapshot check (runs after Vitest in `pnpm test`) |
| `scripts/check-production-journey.mjs` | Static guard on built `journey.html` (CMS scenes present, editorial preview markers absent) |

## Vitest coverage (`apps/web/tests`)

| File | Focus |
| --- | --- |
| `architecture/module-boundaries.test.ts` | Import direction: `historical-domain`, `content-validation`, `design-system`, and `motion` stay isolated from app/CMS/GSAP coupling |
| `historical-integrity.test.ts` | Claim/evidence/chronology invariants; exercises `content-validation` (scene contracts, media rights, evidence links, integrity gate) |
| `production-narrative.test.ts` | Production narrative YAML/manifest alignment |
| `evidence-language.test.ts` | Public copy vs evidence classes |
| `seo-routes.test.ts` | Metadata and crawl routes |
| `env.test.ts` | Environment schema |
| `editorial-preview.test.ts` | Editorial preview allowed only in dev/test or explicit Vercel preview — never on Vercel Production |
| `media-gate.test.ts` | Client media gate behavior |
| `journey-audio.test.ts` | Journey audio control contracts |
| `motion-gsap-registration.test.ts` | `@gsap/react` `useGSAP` registered from `modules/motion/gsap` before client use |
| `framing-baked-text.test.ts` | Framing/baked text motion inputs |

Run only web unit tests: `pnpm --filter @kediri/web test`.

### Vitest pins and config

- **Package:** `vitest` is a devDependency of `@kediri/web` (`apps/web/package.json`), not the capsule root. Patch bumps (for example security fixes in `@vitest/mocker`) update that manifest and `pnpm-lock.yaml` only.
- **Config:** `apps/web/vitest.config.ts` — Node environment (no browser DOM in unit layer), glob `tests/**/*.test.ts`, explicit `exclude` for `e2e/**` so Playwright specs are never collected by Vitest (they would fail with misleading errors).
- **After a Vitest bump:** from capsule root, `pnpm install --frozen-lockfile` then `pnpm run test`. No config change is required for typical patch releases.

## Playwright — dev server (`pnpm run test:e2e`)

- **Config:** `apps/web/playwright.config.ts`
- **Server:** `next dev` on `127.0.0.1:4321` (Playwright-owned)
- **Projects:** `desktop` (Desktop Chrome), `mobile` (Pixel 7)
- **Ignores:** `production-motion.spec.ts` (production pipeline only)

Port **4321** is intentional: `scripts/serve.mjs` uses **4320** for built artifacts. Sharing a port with `reuseExistingServer: true` can attach to a stale production server and produce false greens.

Primary spec: `e2e/smoke.spec.ts` — semantic HTML, in-journey anchors, evidence affordances, back-navigation, and motion-ready gating (including `data-motion-ready` on desktop variants).

## Playwright — production motion (`pnpm run test:e2e:production:built`)

- **Config:** `apps/web/playwright.production.config.ts`
- **Spec:** `e2e/production-motion.spec.ts` only
- **Base URL:**
  - Local: `http://127.0.0.1:4322` via `next start` (production `NODE_ENV`)
  - Canary: `KEDIRI_MOTION_CANARY_URL` (no local webServer; hits deployed site)

**Projects:**

| Project | Asserts |
| --- | --- |
| `production-desktop` | `__kediriMotion` ready; ScrollTrigger count > 0; scroll changes trigger progress |
| `production-mobile` | Motion runtime ready; native scroll advances |
| `production-reduced-motion` | `activeTriggers()` is 0 (motion disabled path) |

Navigate with `?motionDebug=1` so the runtime exposes `window.__kediriMotion` for assertions. The spec also fails on script 4xx, page errors, console errors, and any `/api/editorial-preview/` request or markup.

**Local full pipeline:** `pnpm run test:e2e:production` runs build with production env placeholders (`scripts/run-production-motion.mjs`), then boundary check, then Playwright.

**Prerequisites for local production motion:**

1. PostgreSQL reachable at the URL used in `run-production-motion.mjs` (default `127.0.0.1:54330`, database `kediri_history_motion`) with migrated/seeded content, **or** use CI/canary against an environment that already serves CMS-backed journey HTML.
2. Chromium: `pnpm exec playwright install --with-deps chromium`

If `check-production-journey.mjs` reports `no CMS scene rendered`, the build output lacks published journey scenes — fix seed/migrate or CMS publish state before debugging GSAP.

## Motion module touchpoint

Central GSAP registration lives in `apps/web/src/modules/motion/gsap.ts` (plugins: ScrollTrigger, ScrollSmoother, SplitText, CustomEase; `useGSAP` registered at module load). Production tests validate that this stack boots in the **webpack production bundle**, not only under `next dev`.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| E2E passes locally but not after `build` | Ran dev tests only; run `pnpm run test:e2e:production:built` |
| Flaky scroll/motion assertions | Measured layout before ScrollTrigger registration; smoke helpers wait for `data-motion-ready` or static-flow fallback |
| Playwright connects to wrong server | Port clash on 4320/4321/4322; stop stray `next start` / `serve.mjs` |
| Production motion fails on editorial markers | Draft/preview content leaked into build; see forbidden strings in `check-production-journey.mjs` |
| Reduced-motion project fails with triggers > 0 | Scene registered ScrollTriggers despite `prefers-reduced-motion: reduce` |

## Related docs

- Capsule verification summary: [README §08](../README.md#08--verification-protocol)
- Production acceptance: [docs/production/04_VISUAL_ACCEPTANCE.md](production/04_VISUAL_ACCEPTANCE.md)
- Motion implementation authority: [docs/production/00_IMPLEMENTATION_AUTHORITY.md](production/00_IMPLEMENTATION_AUTHORITY.md)
