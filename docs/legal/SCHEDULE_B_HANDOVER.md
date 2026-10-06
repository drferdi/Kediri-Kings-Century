# SCHEDULE B — SOURCE CODE & OPERATIONAL HANDOVER

Status: DRAFT — complete and sign through Schedule D

Tujuan handover adalah memastikan Pemerintah Kota Kediri dapat mengoperasikan,
memelihara, memigrasikan, dan mengembangkan Assigned Works tanpa vendor lock-in.

## B.1 Source repository

Wajib diserahkan:

- repository Git pada Final Handover Commit;
- release tag yang identik dengan commit tersebut;
- commit history yang disepakati dalam kontrak;
- branch policy/release workflow documentation; dan
- daftar outstanding issues/known limitations pada tanggal handover.

Repository setelah handover harus berada pada organisasi/account yang
ditentukan Penerima Hak atau mekanisme escrow/transfer yang tertulis.

## B.2 Application and CMS

- source di apps/web/;
- Payload CMS configuration;
- collection/schema definitions;
- migration files;
- seed logic yang memang boleh diserahkan;
- public DTO/query contracts;
- build/start scripts;
- testing configuration; dan
- production verification scripts.

## B.3 Database

Diserahkan sesuai scope dan aturan perlindungan data:

- schema/migrations;
- data dictionary;
- backup/export yang diizinkan;
- checksum backup;
- restore procedure; dan
- daftar data yang sengaja tidak disertakan karena privacy, legal, atau
  provenance restriction.

Personal data tidak boleh disalin ke handover package tanpa dasar dan kontrol
yang sah.

## B.4 Media and provenance

- approved public media package;
- asset manifest;
- provenance/rights notes;
- checksum package;
- daftar private masters yang boleh diserahkan;
- daftar private masters yang tidak boleh diserahkan; dan
- mapping media ke scene/content record.

Tidak boleh menghapus caveat hak hanya agar handover terlihat lengkap.

## B.5 Environment and secrets

Repository hanya memuat nama variable, bukan secret.

Pada handover:

1. buat inventory environment variables;
2. transfer secret yang memang milik proyek melalui secure channel;
3. rotate seluruh secret setelah transfer;
4. cabut credential sementara milik Pengalih;
5. pindahkan ownership akun hanya bila account tersebut termasuk kontrak;
6. dokumentasikan credential yang harus dibuat ulang oleh Penerima Hak.

Temporary local-clone repository password yang digunakan selama development
bukan bagian dari source assignment sebagai credential tetap. Penerima Hak
wajib menetapkan secret baru setelah handover.

## B.6 Deployment

Dokumentasi minimum:

- Node/pnpm versions;
- build command;
- start command;
- database migration procedure;
- storage dependencies;
- environment inventory;
- production domain mapping;
- rollback procedure;
- backup/restore procedure; dan
- smoke/canary verification procedure.

Account Vercel/cloud/provider tidak dianggap berpindah kecuali dicatat eksplisit
di Schedule D.

## B.7 Operational verification

Sebelum acceptance, environment handover harus dapat menjalankan protocol
repository yang berlaku pada Final Handover Commit, termasuk lint, typecheck,
tests, production build, dan deploy dry-run sesuai dokumentasi proyek.

Acceptance tidak boleh hanya didasarkan pada screenshot.

## B.8 Knowledge transfer

Minimal satu knowledge-transfer record mencakup:

- architecture;
- Payload CMS operations;
- database migration;
- media/provenance model;
- Journey production structure;
- deployment and rollback;
- backup/restore;
- security/secret rotation; dan
- known limitations.

Tanggal/sesi: [●]
Peserta: [●]
Dokumen/rekaman: [●]

## B.9 Handover completion

Handover dianggap selesai hanya setelah Schedule D mencatat:

- Final Handover Commit;
- release tag;
- artifact checksums;
- BAST;
- payment condition;
- credential rotation status; dan
- tanda tangan Para Pihak.
