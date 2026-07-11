# 08 · Roadmap

## 🟢 MVP — fondasi penghasil lead & konten
- **Setup/Infra:** Next.js + OpenNext + Wrangler (D1/R2/KV bindings), Drizzle, Tailwind + design tokens, tema Light/Dark.
- **Auth:** Better Auth + RBAC (3 peran) + rute `/panel` rahasia + guard.
- **Publik:** Home, Services (+detail), Portfolio (+detail), Articles (+detail, kategori/tag), About, Contact, Collaboration, Privacy/ToS, 404.
- **CMS:** Dashboard Overview, Articles (Tiptap; draft/scheduled/published), Portfolio, Services, Categories/Tags, Media Library (R2), Collaboration & Contact (pipeline), User Management + RBAC.
- **Lead:** form + Turnstile + Zod + email notifikasi + rate-limit.
- **SEO teknis:** metadata dinamis, OG/Twitter, JSON-LD, sitemap.xml, robots.txt, ISR + revalidation, cron scheduled-publish.
- **Gate rilis:** Lighthouse ≥95 (Home, Portfolio Detail, Article Detail).

## 🔵 Version 1.0 — kredibilitas & kontrol penuh CMS
- Publik: Case Studies, Clients (logo + NDA/Confidential), Testimonials.
- CMS: SEO Manager, Navigation Menu, Site Settings, Activity Logs, Related Articles.
- Peningkatan: preview draft, bulk actions, reorder drag-and-drop, dashboard analytics dasar.

## 🟣 Version 2.0 — skala & pertumbuhan
- Pencarian publik, RSS feed, analytics mendalam, A/B test CTA, sitemap per-tipe.
- Newsletter/subscribe, AI-assist penulisan & SEO (Cloudflare AI), webhook/integrasi (WhatsApp/Slack untuk lead).

## ⚪ Future
- i18n penuh (ID/EN), multi-author + editorial approval, komentar termoderasi, PWA, content versioning, image CDN lanjutan, marketplace template.

## Urutan Implementasi (saat coding)
1. Scaffolding + infra (Cloudflare bindings, DB, auth)
2. Design system + layout publik & admin shell
3. Modul konten inti (Articles → Portfolio → Services)
4. Media + Lead + SEO teknis
5. Hardening (a11y/perf/security) + Lighthouse gate
