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

## Scheduled publish (cron)
Artikel berstatus `scheduled` dipublikasikan oleh endpoint `/api/cron/publish-scheduled`
(dilindungi header `x-cron-secret`). Pemicunya ada di worker terpisah `workers/cron-scheduler`:
```bash
pnpm wrangler deploy --config workers/cron-scheduler/wrangler.jsonc
pnpm wrangler secret put CRON_SECRET --config workers/cron-scheduler/wrangler.jsonc
```
Alternatif tanpa worker: jadwalkan cron eksternal (mis. cron-job.org) untuk `POST`
ke URL tersebut dengan header `x-cron-secret`.

## Struktur
`src/app` (routing: `(public)` & `(admin)/panel`) · `src/modules` (domain per fitur) · `src/server` (db/auth/infra) · `src/components` (design system). Detail: [`docs/07-folder-standards.md`](./docs/07-folder-standards.md).
