# WalDev — Digital Studio Platform

> **Build Digital Products.** — Company website + Portfolio + Blog + CMS/Admin, dibangun di atas Cloudflare.

Public website & Admin CMS dalam satu aplikasi Next.js (Modular Monolith), di-deploy ke **Cloudflare Workers** via OpenNext.

## Stack
Next.js · React · TypeScript · Tailwind CSS v4 · Cloudflare Workers/D1/R2/KV · Drizzle ORM · Zod · Better Auth · pnpm.

## Dokumentasi Perencanaan
Lihat [`docs/`](./docs/README.md) — PRD, SRS, IA/User Flow, Database/ERD, API, Coding Standards, Roadmap.

## Prasyarat
- Node ≥ 20, pnpm ≥ 9
- Akun Cloudflare (untuk membuat D1/R2/KV dan deploy)

## Setup Lokal
```bash
pnpm install
cp .dev.vars.example .dev.vars      # isi secrets
pnpm cf-typegen                     # generate cloudflare-env.d.ts dari wrangler.jsonc
pnpm dev                            # http://localhost:3000
```

## Membuat Resource Cloudflare (sekali di awal)
Perlu login: `pnpm wrangler login`. Lalu:
```bash
pnpm wrangler d1 create waldev-db          # salin database_id -> wrangler.jsonc
pnpm wrangler r2 bucket create waldev-media
pnpm wrangler kv namespace create CACHE_KV # salin id -> wrangler.jsonc
```
Ganti `REPLACE_WITH_*` di `wrangler.jsonc` dengan ID hasil di atas.

## Database (Drizzle + D1)
```bash
pnpm db:generate            # buat migrasi SQL dari schema
pnpm db:migrate:local       # terapkan ke D1 lokal
pnpm db:migrate:remote      # terapkan ke D1 production
```

## Build & Deploy (Cloudflare)
```bash
pnpm preview   # build OpenNext + jalankan di runtime Workers lokal
pnpm deploy    # build + deploy ke Cloudflare Workers
```

### Kenapa `build` memakai `--webpack`
Sejak Next.js 16, `next build` memakai Turbopack secara default. Bundel server yang
dihasilkannya **tidak jalan di Cloudflare Workers**: setiap rute mati dengan
`ChunkLoadError: Failed to load chunk server/chunks/ssr/...` sehingga seluruh situs
membalas 500. Karena itu skrip `build` dikunci ke `next build --webpack`. Jangan
melepas flag ini tanpa memverifikasi lebih dulu lewat `wrangler versions upload` dan
membuka URL pratinjaunya — kesalahannya tidak terlihat saat `next build` maupun
`pnpm dev`, hanya setelah tayang.

### Membangun dari Windows
OpenNext memang menyarankan WSL. Bila tetap dibangun langsung di Windows, esbuild
bisa gagal dengan `Cannot read directory ... Access is denied` karena langkah
penyalinan membuat symlink **berkas** yang menunjuk direktori di dalam
`.open-next/.../node_modules/.pnpm/next@*/node_modules`. Jalan pintasnya: ganti
symlink `react`, `react-dom`, dan `styled-jsx` pada store sumber dengan salinan
direktori sungguhan. Selain itu pnpm 11 mengabaikan `pnpm.onlyBuiltDependencies` di
`package.json` dan menghentikan `pnpm build` dengan `ERR_PNPM_IGNORED_BUILDS`;
sementara ini bisa dilewati dengan `pnpm-workspace.yaml` berisi `allowBuilds` dan
`.npmrc` berisi `verify-deps-before-run=false` (keduanya lokal, jangan di-commit).

## Scheduled publish (cron)
Artikel berstatus `scheduled` dipublikasikan oleh endpoint `/api/cron/publish-scheduled`
(dilindungi header `x-cron-secret`). Pemicunya ada di worker terpisah `workers/cron-scheduler`:
```bash
pnpm wrangler deploy --config workers/cron-scheduler/wrangler.jsonc
pnpm wrangler secret put CRON_SECRET --config workers/cron-scheduler/wrangler.jsonc
```
Alternatif tanpa worker: jadwalkan cron eksternal (mis. cron-job.org) untuk `POST`
ke URL tersebut dengan header `x-cron-secret`.

## Data contoh untuk pengembangan lokal
Beranda menampilkan harga layanan, testimoni, dan tombol WhatsApp hanya bila datanya
ada di CMS. Supaya seluruh bagian terlihat saat dikembangkan:
```bash
node scripts/seed-dummy-lokal.mjs           # isi D1 lokal dengan data contoh
node scripts/seed-dummy-lokal.mjs --bersih  # kembalikan ke keadaan kosong
```
Skrip ini selalu memakai flag `--local`, jadi tidak bisa menyentuh database produksi.
**Nilainya fiktif** — nomor WhatsApp dan angka harga di dalamnya tidak boleh disalin ke
Site Settings produksi. Isi nilai sebenarnya lewat `/panel/settings`, `/panel/services`,
dan `/panel/testimonials` sebelum deploy.

## Struktur
`src/app` (routing: `(public)` & `(admin)/panel`) · `src/modules` (domain per fitur) · `src/server` (db/auth/infra) · `src/components` (design system). Detail: [`docs/07-folder-standards.md`](./docs/07-folder-standards.md).
