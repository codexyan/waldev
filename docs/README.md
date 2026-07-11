# WalDev — Dokumentasi Perencanaan

Dokumentasi hidup untuk **WalDev — Digital Studio Platform** (*Build Digital Products.*). Semua dokumen di bawah adalah sumber kebenaran perencanaan sebelum & selama implementasi.

## Daftar Dokumen
1. [01 · Analisis Bisnis & Kebutuhan Pengguna](./01-business-users.md)
2. [02 · Product Requirements Document (PRD)](./02-prd.md)
3. [03 · Software Requirements Specification (SRS)](./03-srs.md)
4. [04 · Information Architecture & User Flow](./04-ia-userflow.md)
5. [05 · Database Schema & ERD](./05-database-erd.md)
6. [06 · API Design](./06-api.md)
7. [07 · Struktur Folder & Coding Standards](./07-folder-standards.md)
8. [08 · Roadmap](./08-roadmap.md)

## Keputusan Arsitektur Terkunci
| Area | Keputusan |
|---|---|
| Deployment | Next.js via `@opennextjs/cloudflare` → **Cloudflare Workers** |
| Arsitektur | Modular Monolith (route group `(public)`/`(admin)`, DB sama) |
| Auth | Better Auth (email+password, RBAC), Drizzle + D1, admin-only |
| Rute admin | Basis `/panel` (via env, noindex, tak tertaut publik) |
| DB | Cloudflare D1 (SQLite) + Drizzle · media di R2 · ISR cache di KV/R2 |
| Editor | Tiptap (JSON → HTML tersanitasi) |
| Anti-spam | Cloudflare Turnstile · Validasi Zod (client+server) |

## Stack
Next.js · React · TypeScript · Tailwind CSS · Cloudflare Workers/D1/R2/KV · Drizzle ORM · Zod · Better Auth · Tiptap · pnpm.
