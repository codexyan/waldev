# 07 · Struktur Folder & Coding Standards

## Bagian A — Struktur Folder
Pendekatan: **feature-based (modular) + Clean Architecture**. `app/`=routing/presentasi · `modules/`=domain per fitur · `server/`=adapter infra · `components/`=design system.

```
waldev/
├─ src/
│  ├─ app/
│  │  ├─ (public)/                # layout & bundle publik terpisah
│  │  │  ├─ layout.tsx  page.tsx  # Home
│  │  │  ├─ services/[slug]/  portfolio/[slug]/
│  │  │  ├─ articles/[slug]/  articles/category/[slug]/
│  │  │  ├─ about/ contact/ collaboration/
│  │  │  └─ privacy-policy/ terms-of-service/
│  │  ├─ (admin)/panel/           # rute rahasia (base via env)
│  │  │  ├─ layout.tsx  login/  page.tsx (Overview)
│  │  │  ├─ articles/ portfolio/ services/ media/
│  │  │  ├─ categories/ tags/ collaboration/ contact-messages/
│  │  │  └─ users/ roles/
│  │  ├─ api/
│  │  │  ├─ auth/[...all]/route.ts
│  │  │  ├─ media/upload-url/route.ts  media/confirm/route.ts
│  │  │  └─ cron/publish-scheduled/route.ts
│  │  ├─ sitemap.ts  robots.ts  layout.tsx  not-found.tsx
│  ├─ modules/                    # DOMAIN per fitur
│  │  ├─ articles/ { *.schema.ts, *.dal.ts, *.actions.ts, *.types.ts, components/ }
│  │  ├─ portfolio/ services/ media/ leads/ taxonomy/
│  │  └─ auth/ rbac/ users/ settings/ seo/ navigation/
│  ├─ server/                     # INFRA adapters
│  │  ├─ db/ { schema.ts, client.ts, seed.ts }
│  │  ├─ auth/config.ts  rbac/
│  │  └─ r2/ email/ turnstile/ cache/
│  ├─ components/ { ui/, layout/, seo/, theme/ }
│  ├─ lib/  styles/  types/
├─ drizzle/                       # migrasi generated
├─ public/  open-next.config.ts  wrangler.jsonc  drizzle.config.ts
├─ next.config.ts  tailwind (globals.css)  tsconfig.json
├─ eslint.config.mjs  .prettierrc  .dev.vars(.example)
└─ package.json  pnpm-lock.yaml
```
**Aliran data (Clean Arch):** `app (RSC/Action)` → `modules/*.dal/*.actions` → `server/db (Drizzle)` → `D1`. Presentasi tak menyentuh Drizzle langsung; dependensi mengarah ke dalam.

## Bagian B — Coding Standards
**Tipe:** TS `strict`; dilarang `any`; return type eksplisit fungsi publik. **Zod = sumber tipe I/O** (`z.infer`). **Drizzle = sumber tipe DB**; tanpa raw SQL concat.
**Penamaan:** komponen `PascalCase`; fungsi/var `camelCase`; file/folder `kebab-case`; konstanta/env `SCREAMING_SNAKE`; boolean `is/has/can`. Satu tanggung jawab/file; hindari file >~300 baris.
**React/Next:** default Server Components; `"use client"` hanya bila perlu; fetch di server; mutasi via Server Action; **validasi selalu server**; tanpa rahasia di client bundle.
**Keamanan:** sanitasi HTML Tiptap (XSS); **RBAC dicek server tiap action/handler admin**; security headers (CSP/HSTS); CSRF-safe; rate-limit; Turnstile.
**Styling:** Tailwind + design tokens (tanpa magic value); varian via `cva`; primitif reusable `components/ui`; mobile-first; Light/Dark (`class`); WCAG AA.
**Proses:** ESLint + Prettier; import order; pre-commit husky + lint-staged (typecheck+lint+format); Conventional Commits; branch `feature/*`; PR + review.
**Prinsip:** SOLID/DRY/KISS — DAL memisah concern, Zod reusable, hindari abstraksi prematur.
**Testing:** Vitest (unit: schema/DAL/utils) · Playwright (e2e: lead & publish) · uji akses RBAC. A11y & Lighthouse di CI (gate ≥95).
