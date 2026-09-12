# WalDev — Dokumentasi Perencanaan

Dokumentasi hidup untuk **WalDev — Arsip Aplikasi** (*Build Digital Products.*). Arah yang berlaku ada di dokumen 09; dokumen 01–08 disimpan sebagai riwayat arah lama (situs jasa studio).

## Daftar Dokumen
1. [01 · Analisis Bisnis & Kebutuhan Pengguna](./01-business-users.md) — riwayat
2. [02 · Product Requirements Document (PRD)](./02-prd.md) — riwayat
3. [03 · Software Requirements Specification (SRS)](./03-srs.md) — riwayat
4. [04 · Information Architecture & User Flow](./04-ia-userflow.md) — riwayat
5. [05 · Database Schema & ERD](./05-database-erd.md) — konvensi masih berlaku, tabel jasa sudah dihapus
6. [06 · API Design](./06-api.md) — riwayat
7. [07 · Struktur Folder & Coding Standards](./07-folder-standards.md)
8. [08 · Roadmap](./08-roadmap.md) — riwayat
9. [09 · Perombakan: WalDev sebagai Arsip Aplikasi](./09-arsip-aplikasi.md) — **berlaku sejak 2026-09-12**

## Keputusan Arsitektur Terkunci
| Area | Keputusan |
|---|---|
| Deployment | Next.js via `@opennextjs/cloudflare` → **Cloudflare Workers** (build dikunci ke webpack) |
| Arsitektur | Modular Monolith (route group `(public)`/`(admin)`, DB sama) |
| Auth | Better Auth (email+password, RBAC), Drizzle + D1, admin-only |
| Rute admin | Basis `/panel` (via env, noindex, tak tertaut publik) |
| DB | Cloudflare D1 (SQLite) + Drizzle · media di R2 · cache pengaturan & menu di KV |
| Editor | Tiptap (JSON → HTML tersanitasi) |
| Validasi | Zod (client+server) |

## Stack
Next.js · React · TypeScript · Tailwind CSS · Cloudflare Workers/D1/R2/KV · Drizzle ORM · Zod · Better Auth · Tiptap · pnpm.
