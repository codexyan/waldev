# WalDev — Arsip Aplikasi

> **Build Digital Products.** — Arsip aplikasi yang saya bangun dan rawat, lengkap dengan catatan pembuatannya, dikelola lewat panel CMS dan berjalan di Cloudflare.

Situs publik dan panel admin dalam satu aplikasi Next.js (Modular Monolith), di-deploy ke **Cloudflare Workers** via OpenNext. Arah produk dan rencana kerjanya ada di [`docs/09-arsip-aplikasi.md`](./docs/09-arsip-aplikasi.md).

## Stack
Next.js · React · TypeScript · Tailwind CSS v4 · Cloudflare Workers/D1/R2/KV · Drizzle ORM · Zod · Better Auth · Tiptap · pnpm.

## Dokumentasi
Lihat [`docs/`](./docs/README.md). Dokumen 01–08 mencatat arah lama (situs jasa studio); bila bertentangan, dokumen 09 yang berlaku.

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
Selalu baca SQL hasil `db:generate` sebelum diterapkan:
- Untuk kolom baru ber-FK pada tabel yang sudah ada, drizzle-kit menulis `REFERENCES` tanpa `ON DELETE`. Tambahkan secara manual, lalu cek dengan `PRAGMA foreign_key_list(tabel)`.
- Migrasi yang menghapus tabel baru boleh diterapkan ke produksi setelah kode yang tidak lagi membaca tabel itu tayang. Urutannya ada di docs/09 bagian 9.2.

## Build & Deploy (Cloudflare)
```bash
pnpm preview   # build OpenNext + jalankan di runtime Workers lokal
```

### Menerbitkan ke produksi
Produksi berjalan di paket Workers Free (CPU 10 ms per permintaan), jadi halaman publik
disajikan sebagai berkas statis. **Jangan pakai `pnpm deploy`**: hasilnya tanpa halaman
statis, dan halaman publik membalas Error 1102.
```bash
pnpm terbitkan                                     # build + render halaman publik dengan data produksi
npx wrangler versions upload                       # versi baru, 0% trafik; buka URL pratinjaunya
npx wrangler versions deploy <uuid-penuh>@100% -y  # tayangkan
```
Jalankan setiap kali konten publik di panel atau kode halaman publik berubah. Cara kerja,
pemeriksaan, dan batasannya ada di [`docs/10-rencana-tayang.md`](./docs/10-rencana-tayang.md)
bagian 5. Build dari push ke `main` sengaja digagalkan: skrip `build` berhenti bila
`WORKERS_CI=1` (dipasang Workers Builds), jadi Cloudflare tidak mengunggah versi tanpa
halaman statis. Detail dan cara melepasnya ada di docs/10 langkah 1 dan 10.

### Kenapa `build` memakai `--webpack`
Sejak Next.js 16, `next build` memakai Turbopack secara default. Bundel server yang
dihasilkannya **tidak jalan di Cloudflare Workers**: setiap rute mati dengan
`ChunkLoadError: Failed to load chunk server/chunks/ssr/...` sehingga seluruh situs
membalas 500. Karena itu skrip `build` dikunci ke `next build --webpack`. Jangan
melepas flag ini tanpa memverifikasi lebih dulu lewat `wrangler versions upload` dan
membuka URL pratinjaunya — kesalahannya tidak terlihat saat `next build` maupun
`pnpm dev`, hanya setelah tayang.

### Membangun dari Windows
OpenNext memang menyarankan WSL. Bila tetap dibangun langsung di Windows, susunan
`node_modules` bawaan pnpm yang penuh symlink membuat esbuild gagal dengan
`Cannot read directory ... Access is denied`: langkah penyalinan membuat symlink
**berkas** yang menunjuk direktori di dalam `.open-next/.../node_modules/.pnpm/next@*/node_modules`.
Solusinya `node_modules` datar. Buat `pnpm-workspace.yaml` lokal (jangan di-commit):

```yaml
allowBuilds:
  esbuild: true
  sharp: true
  unrs-resolver: true
  workerd: true
verifyDepsBeforeRun: false
nodeLinker: hoisted
confirmModulesPurge: false
```

lalu jalankan `pnpm install --frozen-lockfile` sekali.
- `allowBuilds` dibutuhkan karena pnpm 11 mengabaikan `pnpm.onlyBuiltDependencies` di
  `package.json` dan menghentikan build dengan `ERR_PNPM_IGNORED_BUILDS`.
- `verifyDepsBeforeRun: false` karena pnpm 11 tidak lagi membaca `verify-deps-before-run`
  dari `.npmrc`. Tanpa ini setiap `pnpm run` memasang ulang dependensi.
- Pada 12 September 2026 `pnpm install` selesai menulis `node_modules` dalam ±30 detik
  tetapi prosesnya tidak keluar. Setelah `node_modules/.modules.yaml` berisi
  `"nodeLinker": "hoisted"`, proses itu aman dihentikan.

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
Supaya beranda, halaman aplikasi, dan panel "Perlu kabar" tampil berisi saat dikembangkan:
```bash
node scripts/seed-dummy-lokal.mjs           # isi D1 lokal dengan contoh arsip aplikasi
node scripts/seed-dummy-lokal.mjs --bersih  # hapus contoh
```
Skrip ini selalu memakai flag `--local`, jadi tidak bisa menyentuh database produksi.
Isinya **fiktif** dan hanya memakai baris berawalan `contoh_`, sehingga `--bersih` tidak
menghapus aplikasi yang Anda isi sendiri.

## Gambar pratinjau tautan
`public/og.png` dibuat oleh `node scripts/gen-og.mjs`. Jalankan ulang setiap kali judul
beranda, tagline, atau alamat situs berubah.

## Struktur
`src/app` (routing: `(public)` & `(admin)/panel`) · `src/modules` (domain per fitur) · `src/server` (db/auth/infra) · `src/components` (design system). Detail: [`docs/07-folder-standards.md`](./docs/07-folder-standards.md).
