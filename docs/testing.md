# Kediri — Testing and Verification

Executable tests live under `apps/web/tests` (Vitest) and `apps/web/e2e` (Playwright). The capsule root `tests/` directory is a topology placeholder only; see [`tests/README.md`](../tests/README.md).

All commands below run from the **capsule root** unless noted.

## Test layers

| Layer | Runner | What it proves |
| --- | --- | --- |
| Unit and contract | Vitest (`apps/web/tests/`) | Historical-integrity rules, architecture boundaries, env schema, SEO routes, motion registration, token usage, and production-narrative contracts. |
| Journey boundary | `scripts/check-production-journey.mjs` | The built `/journey` HTML contains CMS scenes and no editorial-preview markers or draft copy. |
| Browser (dev) | Playwright + `next dev` on port **4321** | Public reading flows, evidence links, and motion registration timing against a live dev server. |
| Browser (production motion) | Playwright + `next start` on port **4322** (or deployed URL) | GSAP/ScrollTrigger boot, scroll response, reduced-motion behaviour, and zero client/chunk failures on a **production build**. |
| Historical integrity | `pnpm run verify:production` | Payload-backed publication rules against seeded or production-shaped data. |
| Deploy safety | `pnpm run deploy:dry-run` | Artifact shape, environment contract, and client secret-leak checks without production side effects. |

Production motion tests are **intentionally separate** from dev E2E. Dev E2E uses `playwright.config.ts` and ignores `production-motion.spec.ts`. Production motion uses `playwright.production.config.ts` and runs only that spec against a built server or a deployed canary URL.

## Commands

| Command | Scope |
| --- | --- |
| `pnpm run test` | Vitest across `apps/web/tests` plus `scripts/check-tokens.mjs`. |
| `pnpm run test:e2e` | Dev-server Playwright suite (`smoke.spec.ts` and related). |
| `pnpm run test:e2e:production` | Full local production-motion pipeline: webpack build → journey boundary → production Playwright. Sets `NODE_ENV=production` and placeholder DB env (see script). |
| `pnpm run test:e2e:production:built` | Journey boundary check + production Playwright only. Requires an existing `.next` build. |
| `pnpm run verify:production` | Payload historical-integrity verification. |
| `pnpm run verify` | lint → typecheck → test → build → journey boundary → verify:production (no browser). |

From `apps/web` directly:

| Command | Effect |
| --- | --- |
| `pnpm exec vitest run` | Unit tests only. |
| `pnpm run e2e` | Dev Playwright. |
| `pnpm run e2e:production:built` | Production Playwright config only. |

## Vitest coverage (high level)

| File | Focus |
| --- | --- |
| `architecture/module-boundaries.test.ts` | Module dependency direction (`historical-domain`, `content-validation`, `design-system`, `motion`). |
| `historical-integrity.test.ts` | EvidenceClaim / EvidenceLink / publication invariants. |
| `production-narrative.test.ts` | Scene and narrative contract against production docs. |
| `motion-gsap-registration.test.ts` | `@gsap/react`'s `useGSAP` is registered on the shared GSAP instance before client components import motion code. |
| `env.test.ts` | Environment schema. |
| `evidence-language.test.ts`, `media-gate.test.ts`, `framing-baked-text.test.ts`, `journey-audio.test.ts`, `seo-routes.test.ts` | Domain-specific publication and UX contracts. |

## Dev browser tests (`playwright.config.ts`)

- Starts `next dev` on `127.0.0.1:4321` (deliberately **not** 4320 used by `scripts/serve.mjs`).
- Projects: desktop Chrome and Pixel 7.
- `testIgnore: production-motion.spec.ts` keeps dev and production suites from sharing a server mode.

Run after install:

```bash
pnpm exec playwright install --with-deps chromium
pnpm run test:e2e
```

## Production motion tests

### Local full pipeline

`scripts/run-production-motion.mjs` runs, in order:

1. `pnpm --filter @kediri/web build` with production env placeholders.
2. `scripts/check-production-journey.mjs` — scans `apps/web/.next/server/app/journey.html`.
3. `pnpm --filter @kediri/web e2e:production:built`.

Trigger from capsule root:

```bash
pnpm run test:e2e:production
```

### Built-only (CI and canary)

When `.next` already exists from `pnpm run build`:

```bash
pnpm run test:e2e:production:built
```

`playwright.production.config.ts` behaviour:

- **Local:** starts `next start -H 127.0.0.1 -p 4322` against the existing build.
- **Deployed canary:** when `KEDIRI_MOTION_CANARY_URL` is set, skips `webServer` and hits that URL (used by `.github/workflows/production-motion-canary.yml` for `https://kediri.sentrahai.com`).
- Projects: `production-desktop`, `production-mobile`, `production-reduced-motion` (`prefers-reduced-motion: reduce`).
- `fullyParallel: false` — one browser context at a time for stable motion reads.

### What `production-motion.spec.ts` asserts

On `/journey?motionDebug=1`:

1. `#historical-content` is visible.
2. No `/api/editorial-preview/` assets in the DOM.
3. `window.__kediriMotion` becomes available within 10s.
4. **Desktop:** at least one live ScrollTrigger; scroll changes trigger progress.
5. **Mobile:** native scroll advances.
6. **Reduced motion:** `activeTriggers()` is `0`.
7. No page errors, console errors, or failed script responses.

The debug handle is exposed only when `motionDebug=1` is in the query string or `NEXT_PUBLIC_MOTION_DEBUG=1` is set. See `apps/web/src/modules/motion/gsap.ts` (`isMotionDebug`, `exposeMotionDebug`).

## CI workflows

| Workflow | Trigger | Relevant steps |
| --- | --- | --- |
| `.github/workflows/ci.yml` | `workflow_dispatch` only (capsule contract; inert while nested in Monorepo) | After build and `verify:production`: `test:e2e:production:built`, then `test:e2e`, then deploy dry-run. |
| `.github/workflows/production-motion-canary.yml` | Successful deployment status or `workflow_dispatch` | Installs deps, runs `e2e:production:built` against `KEDIRI_MOTION_CANARY_URL=https://kediri.sentrahai.com`. Uploads Playwright artifacts on failure. |

## Troubleshooting

### Production motion fails locally but dev E2E passes

Production motion exercises the **webpack build** and `next start`, not `next dev`. Rebuild first:

```bash
pnpm run build
pnpm run test:e2e:production:built
```

Hydration, chunk, or GSAP registration bugs often appear only in production mode.

### `check-production-journey.mjs` fails

- **No CMS scenes:** run `pnpm run db:migrate && pnpm run db:seed` before build, or build against the same DB used for seeding.
- **Editorial marker leaked:** a draft/preview string or `/api/editorial-preview/` reference reached the server HTML. Fix the Journey data layer or component — do not weaken the check.

### Port conflicts

| Port | Owner |
| --- | --- |
| 4320 | `scripts/serve.mjs` / `@kediri/web start` default |
| 4321 | Dev Playwright (`playwright.config.ts`) |
| 4322 | Production motion Playwright (`playwright.production.config.ts`) |

If dev E2E reports green against stale code, confirm nothing else is bound to 4321 with `reuseExistingServer` picking up an old process.

### Playwright browsers missing

```bash
pnpm exec playwright install --with-deps chromium
```

### Inspecting motion at runtime

Add `?motionDebug=1` to Journey in a browser, then in DevTools:

```js
window.__kediriMotion?.activeTriggers()
window.__kediriMotion?.ScrollTrigger.getAll().map(t => t.progress)
```

ScrollTrigger markers render only under the same debug gate.

## Related docs

- Capsule verification summary: [README §08](../README.md#code08--verification-protocolcode)
- Production authority and acceptance: [`docs/production/`](production/)
- Motion module registration: `apps/web/src/modules/motion/gsap.ts`
