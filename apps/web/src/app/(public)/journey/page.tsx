import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type ReactElement } from "react";
import {
  type ActHeaderMode,
  ActHeaderReveal,
} from "../../../components/journey/act-header-reveal";
import { ActMilestoneTicker } from "../../../components/journey/act-milestone-ticker";
import { DeepLinkLanding } from "../../../components/journey/deep-link-landing";
import { FinaleMotion } from "../../../components/journey/finale-motion";
import { JourneyAudio } from "../../../components/journey/journey-audio";
import {
  JourneyTimeline,
  type TimelineEntry,
} from "../../../components/journey/journey-timeline";
import { MotionRefreshGate } from "../../../components/journey/motion-refresh-gate";
import { PrologueInscriptionInterlude } from "../../../components/journey/prologue-inscription-interlude";
import {
  FramingStage,
  PrologueScene,
} from "../../../components/journey/prologue-scene";
import { ReadoutBatch } from "../../../components/journey/readout-batch";
import { SceneOpeningAddress } from "../../../components/journey/scene-opening-address";
import { SceneSection } from "../../../components/journey/scene-section";
import { SiteFooter } from "../../../components/site-footer";
import { JOURNEY_MILESTONES } from "../../../content/journey-milestones";
import {
  composeProductionJourney,
  PRODUCTION_FINALE,
  PRODUCTION_PROLOGUE,
} from "../../../content/production-narrative";
import { getJourneyManifest } from "../../../content/queries";
import { OPEN_GRAPH_BASE, SITE_TITLE, TWITTER_BASE } from "../../../site";

/**
 * Journey adalah SATU rute dengan anchor yang stabil (UX Bible bagian 5).
 * Dua puluh enam scene bukan dua puluh enam rute — itulah yang menjaga
 * kesinambungan gulir sekaligus membuat setiap masa dapat ditautkan dan
 * dibagikan.
 *
 * Halaman ini Server Component. Seluruh sejarahnya ada di HTML sebelum satu
 * baris JavaScript berjalan; satu-satunya island klien adalah overlay Timeline,
 * dan bila ia gagal dimuat, /explore/timeline memuat kronologi yang sama.
 */
/**
 * Latar kartu judul act memakai aset produksi yang sudah dipromosikan
 * ke /journey-approved/. "Panjalu Rises" memakai citra yang semula milik scene Daha —
 * scene Daha sendiri kini bergerak sebagai video dahanasada. Babak I kembali
 * menjadi kartu tipografis agar Prolog water→copper tidak dipotong footage
 * Jayabaya sebelum pintu kronologi 879.
 */
const ACT_HEADER_MEDIA: Readonly<Record<string, string>> = {
  /*
   * Kartu "Panjalu Bangkit" kembali memakai citra diam Daha: footage
   * kehidupan sehari-hari kini menjadi babak kedua pembuka Prolog (direktif
   * Chief 2026-09-04), dan menayangkannya dua kali dalam satu halaman
   * membuat kartu judul ini terbaca sebagai pengulangan, bukan babak baru.
   */
  "panjalu-rises": "/journey-approved/05-daha-centre-of-power.webp",
};

/**
 * Mode kartu judul per act (audit 2026-09-03). Semua act kini bergerak;
 * identitasnya berbeda supaya tidak ada dua kartu berturut-turut yang sama:
 *   - Babak I: `card` (media dolly + topeng baris; handoff ke sambutan pembuka);
 *   - act bermedia lain: `wipe` (tirai clip-path);
 *   - Babak III (teks panjang tanpa media): `scrubWords` (sorot kata mengikuti gulir);
 *   - selebihnya: `card`.
 */
function actHeaderMode(slug: string): ActHeaderMode {
  if (slug === "the-throne-breaks") return "scrubWords";
  if (slug === RIGHT_LAYOUT_FROM) return "slide";
  if (ACT_HEADER_MEDIA[slug] && slug !== "the-land-remembers") {
    return "wipe";
  }
  return "card";
}

/**
 * Pembeda paruh kedua Journey (direktif Chief 2026-09-03): mulai "Besi, Gula,
 * dan Kota Modern" ke bawah, pelat naskah berpindah ke SISI KANAN bingkai dan
 * duduk di tengah vertikal (tidak lagi menempel dasar bingkai). Transisi dari
 * 1678 ke kartu judul act ini bergeser ke kanan (mode `slide`). Desktop dan
 * tablet saja — mobile tetap novel grafis vertikal.
 */
const RIGHT_LAYOUT_FROM = "iron-sugar-modern-city";

/**
 * Journey adalah halaman indeksabel yang berdiri sendiri, jadi ia memikul
 * judul penuh dan kanonisnya sendiri — bukan mewarisi kanonis beranda.
 */
const JOURNEY_DESCRIPTION =
  "Perjalanan sejarah Kediri dari 879 hingga 2026 dalam satu halaman berkelanjutan: prasasti, kerajaan, kolonialisme, industri, dan kota hari ini.";

export const metadata: Metadata = {
  title: { absolute: `Journey | ${SITE_TITLE}` },
  description: JOURNEY_DESCRIPTION,
  alternates: { canonical: "/journey" },
  openGraph: {
    ...OPEN_GRAPH_BASE,
    url: "/journey",
    title: `Journey | ${SITE_TITLE}`,
    description: JOURNEY_DESCRIPTION,
  },
  twitter: {
    ...TWITTER_BASE,
    title: `Journey | ${SITE_TITLE}`,
    description: JOURNEY_DESCRIPTION,
  },
};

export default async function JourneyPage(): Promise<ReactElement> {
  const publishedManifest = await getJourneyManifest();
  // Urutan, copy, dan visual intent Journey mengikuti kanon produksi 26 scene.
  // Relasi event, bukti, dan media yang sudah terbit tetap dioverlay dari CMS
  // berdasarkan slug. Aset fallback produksi dilayani dari /journey-approved/,
  // bukan dari route editorial-preview yang tetap tertutup di production.
  const manifest = composeProductionJourney(publishedManifest);
  const rightLayoutIndex = manifest.acts.findIndex(
    (act) => act.slug === RIGHT_LAYOUT_FROM,
  );
  const orderedScenes = manifest.acts.flatMap((act) =>
    act.scenes.map((scene) => ({ scene, actTitle: act.title })),
  );
  const nextSceneBySlug = new Map(
    orderedScenes.map(({ scene }, index) => [
      scene.slug,
      orderedScenes[index + 1]?.scene.slug,
    ]),
  );
  const timelineEntries: TimelineEntry[] = orderedScenes.map(
    ({ scene, actTitle }) => ({
      slug: scene.slug,
      dateDisplay: scene.dateDisplay,
      title: scene.title,
      actTitle,
      isHero: scene.sceneType === "hero",
    }),
  );

  return (
    <div className="shell" data-journey="true">
      <DeepLinkLanding />
      {/*
       * Satu pemilik refresh ScrollTrigger (font + media kritis) dan pegangan
       * debug motion untuk seluruh halaman — bukan per island.
       */}
      <MotionRefreshGate />
      {/*
       * Nav journey adalah overlay `position: fixed` — ia dan panel Timeline
       * WAJIB hidup di luar #smooth-wrapper: elemen fixed di dalam konten
       * yang ditransformasikan ScrollSmoother menjadi relatif terhadap konten
       * dan ikut tergulir (aturan resmi ScrollSmoother; terbukti oleh e2e
       * "Timeline pushState lands on a readable early scene").
       */}
      <nav className="site-nav" aria-label="Navigasi Journey">
        <Link href="/" className="wordmark">
          Kediri
        </Link>
        <ul>
          <li>
            <JourneyTimeline entries={timelineEntries} />
          </li>
          <li>
            <Link href="/explore/timeline">Explore</Link>
          </li>
          <li>
            <Link href="/sources">Sumber</Link>
          </li>
          <li>
            <JourneyAudio />
          </li>
        </ul>
      </nav>
      {/*
       * Kerangka ScrollSmoother (100% GSAP, direktif Chief 2026-08-28).
       * Server hanya merender dua div ini; smoother-nya sendiri diciptakan
       * ber-refcount oleh island motion pertama pada varian desktop/tablet
       * (modules/motion/smooth.ts). Tanpa JavaScript atau pada mobile/reduced,
       * keduanya div biasa dan halaman menggulir native.
       */}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main id="historical-content">
            <PrologueScene narrative={PRODUCTION_PROLOGUE} />

            {manifest.acts.map((act, actIndex) => (
              <section
                key={act.id}
                className="journey-act"
                data-era={act.visualEraKey}
                data-layout={
                  rightLayoutIndex >= 0 && actIndex >= rightLayoutIndex
                    ? "right"
                    : undefined
                }
                aria-labelledby={`act-${act.slug}`}
              >
                <header
                  data-header-media={
                    ACT_HEADER_MEDIA[act.slug]
                      ? "true"
                      : undefined
                  }
                  data-opening-handoff-source={
                    act.slug === "the-land-remembers"
                      ? "true"
                      : undefined
                  }
                >
                  <ActHeaderReveal
                    enabled
                    mode={actHeaderMode(act.slug)}
                  >
                    {ACT_HEADER_MEDIA[act.slug] ? (
                      <span className="act-header-media" aria-hidden="true">
                        {ACT_HEADER_MEDIA[act.slug]?.endsWith(".mp4") ? (
                          <video
                            src={ACT_HEADER_MEDIA[act.slug]}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          // biome-ignore lint/performance/noImgElement: aset produksi statis disajikan langsung tanpa loader tambahan.
                          <img
                            src={ACT_HEADER_MEDIA[act.slug]}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </span>
                    ) : null}
                    <p className="archive-label">{act.dateRangeDisplay}</p>
                    <h2 id={`act-${act.slug}`} className="title-scene">
                      {act.title}
                    </h2>
                    {act.introCopy
                      ? (Array.isArray(act.introCopy)
                          ? act.introCopy
                          : [act.introCopy]
                        ).map((paragraph) => (
                          <p className="lead measure" key={paragraph}>
                            {paragraph}
                          </p>
                        ))
                      : null}
                    {act.slug === "the-land-remembers" ? (
                      <ActMilestoneTicker milestones={JOURNEY_MILESTONES} />
                    ) : null}
                  </ActHeaderReveal>
                </header>

                {act.slug === "the-land-remembers" ? (
                  <SceneOpeningAddress />
                ) : null}

                {act.scenes.map((scene) => (
                  <Fragment key={scene.id}>
                    <SceneSection
                      scene={scene}
                      nextSceneSlug={nextSceneBySlug.get(scene.slug)}
                    />
                    {scene.slug === "921-kadhiri" ? (
                      <PrologueInscriptionInterlude />
                    ) : null}
                  </Fragment>
                ))}
              </section>
            ))}

            <FinaleMotion>
              <section
                  className="journey-finale"
                  aria-labelledby="journey-finale"
                >
                  <div className="finale-frame">
                    {PRODUCTION_FINALE.media ? (
                      <FramingStage
                        media={PRODUCTION_FINALE.media}
                        framing="finale"
                      />
                    ) : null}
                    <p className="eyebrow">{PRODUCTION_FINALE.eyebrow}</p>
                    <h2 id="journey-finale" className="title-scene">
                      {PRODUCTION_FINALE.title}
                    </h2>
                    <p className="master-line">
                      {PRODUCTION_FINALE.masterLine}
                    </p>
                    <p className="journey-visual-label">Visualisasi artistik</p>
                  </div>
                  <div className="finale-readout">
                    <div className="narrative-stack">
                      {PRODUCTION_FINALE.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    <div className="finale-coda">
                      <p>Bab berikutnya belum memiliki tanggal.</p>
                      <p>Kediri</p>
                      <p>Djojo ing Bojo</p>
                      <p>Kota ini terus berlanjut.</p>
                    </div>
                  </div>
              </section>
            </FinaleMotion>
          </main>
          {/* Entrance strip arsip (26×) lewat ScrollTrigger.batch, satu pemilik. */}
          <ReadoutBatch />

          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
