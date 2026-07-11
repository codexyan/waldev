# 04 · Information Architecture & User Flow

## Bagian A — Information Architecture

### A.1 Sitemap Publik
```
/ (Home)
├─ /services · /services/[slug]
├─ /portfolio · /portfolio/[slug]
├─ /case-studies · /case-studies/[slug]        (v1.0)
├─ /articles · /articles/[slug]
│   /articles/category/[slug] · /articles/tag/[slug]
├─ /about
├─ /clients · /testimonials                     (v1.0)
├─ /contact · /collaboration
├─ /privacy-policy · /terms-of-service
├─ sitemap.xml · robots.txt  (admin di-exclude)
└─ * → /404
```

### A.2 Struktur Admin (rute rahasia, tak tertaut publik)
```
/panel  (base via env, noindex)
├─ /panel/login
├─ /panel                      (Overview)
├─ /panel/articles · /portfolio · /services
├─ /panel/categories · /tags · /media
├─ /panel/collaboration · /contact-messages
├─ /panel/clients · /testimonials · /navigation · /seo · /settings   (v1.0)
├─ /panel/users · /roles
└─ /panel/activity-logs        (v1.0)
```

### A.3 Struktur URL & Slug
| Entitas | Pola | Slug |
|---|---|---|
| Portfolio | `/portfolio/[slug]` | dari title, unik, immutable setelah publish |
| Article | `/articles/[slug]` | dari title, unik |
| Service | `/services/[slug]` | dari nama, unik |
| Category | `/articles/category/[slug]` | unik per tipe |
| Tag | `/articles/tag/[slug]` | unik |

Aturan slug: lowercase, kebab-case, ASCII, unik (Zod + cek DB). Ubah slug terpublikasi → peringatan (301/SEO).

### A.4 Navigasi Global (CMS, v1.0)
- **Header:** Logo · Services · Portfolio · Articles · About · [CTA "Start a Project"] · Toggle tema.
- **Footer:** ringkasan brand, kolom (Layanan/Perusahaan/Legal), sosial, kontak, copyright.
- Sebelum modul Navigation aktif (MVP): default dari `settings`.

### A.5 Model Konten (relasi konseptual)
Article → 1 Category, N Tags, 1 Author, 1 Cover, N Related · Portfolio → 0..1 Client, N Technologies, N Features, N Gallery · Service → N Features/Workflow/FAQ · Client → N Portfolio, 1 Category, 1 Logo · Testimonial → 0..1 Client, 0..1 Photo · SEO Meta → polimorfik.

## Bagian B — User Flow

### B.1 Pengunjung → Lead (konversi utama)
```
Masuk (Home/SEO/iklan) → jelajah bukti (Portfolio/Case/Testimoni/Services)
 → CTA "Start a Project" → /collaboration (konteks layanan terisi)
 → isi form → Turnstile → Zod (client+server)
 → simpan DB (New) + lampiran R2 + email tim → halaman "Terima kasih"
```

### B.2 Membaca Artikel (SEO loop)
`Google → Article Detail (ISR cepat) → baca → Related/CTA → /collaboration atau artikel lain.`

### B.3 Admin: Login → Publikasi Artikel
```
/panel/login → Better Auth → cek RBAC → Articles → New
 → title(auto-slug) · cover · category · tags · editor Tiptap · SEO
 → Draft → Preview → Publish/Schedule
 → revalidate ISR + Activity Log → live (tanpa deploy/sentuh kode)
```

### B.4 Admin: Menangani Lead
`Dashboard (badge) → Collaboration → detail → hubungi → ubah status (New→…→Completed/Closed) → tiap perubahan tercatat di log.`

### B.5 Admin: Upload Media
`Media Library → Upload → validasi Zod → minta signed URL → PUT R2 → simpan metadata → reusable.`

### B.6 Otomatis: Scheduled Publish
`Cron Cloudflare berkala → artikel 'scheduled' & scheduled_at ≤ now → set 'published' → revalidate → log.`
