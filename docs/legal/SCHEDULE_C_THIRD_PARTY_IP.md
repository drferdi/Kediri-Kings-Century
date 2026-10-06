# SCHEDULE C — THIRD-PARTY IP & EXCLUDED MATERIALS

Status: DRAFT — reconcile before BAST

Prinsip utama: assignment tidak dapat memindahkan hak yang tidak dimiliki
Pengalih.

Daftar ini adalah disclosure minimum, bukan pengganti SBOM/license report final.

## C.1 Direct runtime software dependencies

Versi mengikuti apps/web/package.json pada transaction-preparation baseline.

| Component | Version | Status |
| --- | ---: | --- |
| Next.js | 16.3.0 | Third-party; upstream terms apply |
| React | 19.2.8 | Third-party; upstream terms apply |
| React DOM | 19.2.8 | Third-party; upstream terms apply |
| Payload CMS | 3.89.0 | Third-party; upstream terms apply |
| @payloadcms/db-postgres | 3.88.0 | Third-party; upstream terms apply |
| @payloadcms/next | 3.88.0 | Third-party; upstream terms apply |
| @payloadcms/richtext-lexical | 3.88.0 | Third-party; upstream terms apply |
| @payloadcms/storage-s3 | 3.88.0 | Third-party; upstream terms apply |
| GSAP | 3.15.0 | Third-party; GreenSock Standard "no charge" license |
| @gsap/react | 2.1.2 | Third-party; upstream terms apply |
| @faceless-ui/modal | 3.0.0 | Third-party; upstream terms apply |
| @faceless-ui/scroll-info | 2.0.0 | Third-party; upstream terms apply |
| @t3-oss/env-nextjs | 0.13.8 | Third-party; upstream terms apply |
| GraphQL | 16.14.2 | Third-party; upstream terms apply |
| Sharp | 0.35.3 | Third-party; upstream terms apply |
| Zod | 4.4.3 | Third-party; upstream terms apply |

GSAP upstream currently states that GSAP, including plugins such as
ScrollSmoother, is free for commercial use under its Standard "no charge"
license. This does not transfer GreenSock copyright to Penerima Hak.

Reference:
https://gsap.com/standard-license

## C.2 Development dependencies

Development/test/build dependencies, including but not limited to Biome,
Playwright, TypeScript, Vitest, Node ecosystem transitive packages, and their
binaries remain third-party materials governed by upstream terms.

## C.3 Infrastructure and services

The following categories are not Assigned Works merely because project
configuration refers to them:

- PostgreSQL software and container images;
- MinIO or other S3-compatible object storage software/services;
- Vercel platform;
- GitHub platform;
- DNS registrar/DNS provider;
- cloud storage provider;
- email/monitoring/analytics services; and
- operating-system/container dependencies.

Account ownership is a separate handover matter.

## C.4 Historical and cultural source materials

Excluded unless a separate rights record proves transferability:

- archival photographs;
- scans/manuscripts;
- museum/library/archive collections;
- quoted publications;
- maps;
- third-party historical text;
- institutional logos;
- government marks/emblems;
- photographs or media obtained under permission-only terms; and
- traditional cultural expressions or materials whose legal status requires
  separate treatment.

Project metadata or captions do not create ownership over those materials.

## C.5 Fonts, music, video, images, generated assets

Before BAST, every non-code asset should be classified as one of:

- ASSIGNABLE_ORIGINAL — economic rights owned and included in Schedule A;
- THIRD_PARTY_LICENSED — usable but not owned;
- PUBLIC_DOMAIN / OPEN LICENSE — subject to recorded terms;
- PERMISSION_ONLY — use limited to permission scope;
- RIGHTS_UNCLEAR — cannot be treated as Assigned Work until resolved.

Generated/AI-assisted assets must not automatically be represented as
exclusively copyright-owned without legal review of the applicable creation
facts, provider terms, and human authorship contribution.

## C.6 Brands and identity

Unless a separate written instrument says otherwise, the assignment excludes:

- Sentra Artificial Intelligence name/logo/trade dress;
- dr. Ferdi Iskandar / Drferdi personal identity and branding;
- third-party marks;
- Government of Kediri marks/emblems already owned or controlled by the
  government; and
- domain names.

## C.7 Final SBOM/license disclosure

Before Schedule D is signed, the handover package should include a dependency
inventory generated from the exact Final Handover Commit and an accompanying
third-party license/notice report.

Any conflict between this draft table and the actual upstream license bundled
with the installed package must be resolved in favor of the legally applicable
upstream terms.
