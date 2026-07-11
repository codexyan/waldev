# 03 · Software Requirements Specification (SRS)

**Versi:** 0.1 · Mengikuti keputusan arsitektur terkunci.

## 1. Konteks & Arsitektur Sistem
```
┌───────────────────────── Cloudflare ─────────────────────────┐
│  Worker (Next.js via OpenNext)                                │
│  ├─ (public)  route group  → SSG/ISR, no-auth                 │
│  ├─ (admin)   route group  → SSR, Better Auth + RBAC guard    │
│  └─ API layer (Route Handlers / Server Actions) + Zod         │
│       D1 (Drizzle)   R2 (media)   KV/R2 (ISR cache)           │
│       Turnstile (form)   Email (notifikasi lead)              │
└───────────────────────────────────────────────────────────────┘
```
**Pemisahan Public vs Admin (penegakan):** route group + layout + middleware matcher + bundle terpisah; middleware admin memblokir request tak terautentikasi ke `/(admin)/*`; tanpa import komponen/link admin di bundle publik; rute admin di-`noindex` + `Disallow` + di-exclude dari sitemap.

## 2. Functional Requirements

### Publik — Rendering & Navigasi
- **FR-PUB-01** Halaman konten dirender SSG/ISR + revalidate on-demand saat entitas dipublikasi/diperbarui.
- **FR-PUB-02** Publik hanya tampilkan konten `published` (draft/scheduled tidak bocor).
- **FR-PUB-03** Tanpa elemen login/register/admin di seluruh halaman & source publik.
- **FR-PUB-04** URL ramah SEO berbasis `slug` unik.

### Portfolio
- **FR-POR-01** Detail memuat title, cover, gallery, summary, challenge, solution, tech stack, features, timeline, status, demo/repo URL (opsional), SEO.
- **FR-POR-02** CMS: CRUD penuh + gallery + kaitan klien & status NDA.
- **FR-POR-03** Proyek NDA → "Confidential Project" tanpa identitas klien.

### Articles
- **FR-ART-01** Editor Tiptap → simpan JSON; render aman ke HTML di server.
- **FR-ART-02** Field: title, slug, cover, author, category, tags, body, SEO, related.
- **FR-ART-03** Status `draft`/`scheduled`(auto-publish)/`published`.
- **FR-ART-04** Reading time otomatis. **FR-ART-05** Related articles tampil di detail.

### Services
- **FR-SRV-01** CMS: CRUD nama, deskripsi, feature list, workflow, FAQ, CTA, harga (opsional).
- **FR-SRV-02** CTA → Form Kolaborasi dengan konteks layanan.

### Clients & Testimonials
- **FR-CLI-01** CMS CRUD klien (logo, kategori, portfolio terkait, NDA).
- **FR-TES-01** CMS CRUD testimoni (nama, jabatan, perusahaan, foto opsional, isi, rating, publish). **FR-TES-02** publik hanya `published`.

### Lead — Collaboration & Contact
- **FR-LEAD-01** Field: nama, email, WhatsApp, perusahaan, budget, deadline, jenis proyek, deskripsi, lampiran (R2).
- **FR-LEAD-02** Tersimpan di DB & tampil di CMS.
- **FR-LEAD-03** Status: New → Contacted → Negotiation → Proposal Sent → Deal → Completed → Closed.
- **FR-LEAD-04** Notifikasi email ke tim. **FR-LEAD-05** Turnstile + Zod + rate-limit.
- **FR-CON-01** Contact Message tersimpan dengan status baca/tindak lanjut.

### Media
- **FR-MED-01** Upload R2 via signed URL (image/PDF/document). **FR-MED-02** Validasi tipe/ukuran + metadata. **FR-MED-03** Reusable lintas modul.

### SEO, Navigation, Settings
- **FR-SEO-01** Meta title/description, OG, Twitter, canonical, JSON-LD per entitas/halaman.
- **FR-SEO-02** sitemap.xml & robots.txt dinamis; rute admin dikecualikan/noindex.
- **FR-NAV-01** Menu publik dikelola dari CMS. **FR-SET-01** Site settings dari CMS.

### Auth, RBAC, Audit
- **FR-AUTH-01** Login admin (email+password) via Better Auth; cookie httpOnly/secure; logout.
- **FR-AUTH-02** Tanpa registrasi publik; akun dibuat Admin/Owner.
- **FR-RBAC-01** Peran: Owner, Editor, Sales — hak granular per modul/aksi. **FR-RBAC-02** Otorisasi dicek di server.
- **FR-LOG-01** Activity Logs: aktor, aksi, entitas, waktu.

## 3. Non-Functional Requirements
| ID | Kategori | Requirement |
|---|---|---|
| NFR-PERF-01/02 | Performa | Lighthouse ≥95; LCP<2.5s, CLS<0.1, INP<200ms; ISR + edge cache; Cloudflare Images |
| NFR-A11Y-01 | Aksesibilitas | ≥95; WCAG 2.1 AA; keyboard; kontras; fokus terlihat |
| NFR-SEO-01 | SEO | ≥95; semantic HTML; metadata & structured data lengkap |
| NFR-BP-01 | Best Practices | ≥95; HTTPS; security headers; tanpa error konsol |
| NFR-SEC-01/02/03 | Keamanan | Validasi Zod server; sanitasi Tiptap (XSS); CSRF; rate-limit; rute admin auth+otorisasi server; secrets via bindings; CSP/HSTS |
| NFR-MAINT-01 | Maintainability | TS strict; modular; Clean Arch; DRY/KISS/SOLID; reusable |
| NFR-TYPE-01 | Type-safety | Tipe end-to-end (Drizzle + Zod + TS) |
| NFR-RESP-01 | Responsif | Mobile-first; Light & Dark |
| NFR-SCALE-01 | Skalabilitas | Serverless auto-scale; index D1; paginasi |
| NFR-OBS-01 | Observability | Logging error + Activity Logs; siap analytics |

## 4. Antarmuka Eksternal
D1 (Drizzle) · R2 (media, signed URL) · KV/R2 (ISR cache) · Turnstile · Email (Cloudflare/Resend) · Cloudflare Images.

## 5. Kriteria Penerimaan
Semua FR MVP lolos uji; Lighthouse ≥95 (Home, Portfolio Detail, Article Detail); nol data diedit di source code; rute admin tidak terindeks/terekspos.
