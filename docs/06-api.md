# 06 · API Design

## Filosofi
Modular Monolith Next.js App Router → **tanpa REST API publik penuh**.
| Kebutuhan | Mekanisme | Alasan |
|---|---|---|
| Baca data publik | **RSC → Data Access Layer (DAL)** ke D1 | tanpa HTTP round-trip, type-safe, ISR-friendly |
| Mutasi (form publik & CRUD admin) | **Server Actions** + Zod + guard RBAC | idiomatik, progressive enhancement, validasi server |
| Endpoint semantik HTTP (upload, cron, auth, sitemap, webhook) | **Route Handlers** `app/api/*` | dipanggil infra/eksternal |

Satu **DAL** dipakai bersama RSC + Actions + Handlers (tanpa duplikasi query).

## Route Handlers
| Method · Path | Auth | Tujuan |
|---|---|---|
| `ALL /api/auth/[...all]` | — | Better Auth (login/logout/session) |
| `POST /api/media/upload-url` | `media.create` | Signed URL R2 (PUT) |
| `POST /api/media/confirm` | `media.create` | Finalisasi metadata |
| `GET /api/cron/publish-scheduled` | cron secret | Publikasi artikel terjadwal |
| `GET /sitemap.xml` · `GET /robots.txt` | — | SEO dinamis (admin di-exclude) |
| `GET /rss.xml` | — | Feed artikel (v2.0) |

**Amplop respons:**
```
Success: { "success": true,  "data": <T>, "meta"?: {...} }
Error:   { "success": false, "error": { "code": "...", "message": "...", "fields"?: {...} } }
```
Kode error: VALIDATION_ERROR(400) · UNAUTHORIZED(401) · FORBIDDEN(403) · NOT_FOUND(404) · CONFLICT(409) · RATE_LIMITED(429) · INTERNAL(500). Pesan tidak membocorkan internal.

## Server Actions
Pola: `create/update/delete/publish`. Wrapper tiap action: `auth → cek RBAC → parse Zod → DAL → revalidate → log`.

| Modul | Actions | Guard |
|---|---|---|
| Articles | create/update/delete/publish/scheduleArticle | `article.*` |
| Portfolio | create/update/deletePortfolio, reorderGallery | `portfolio.*` |
| Services | create/update/deleteService | `service.*` |
| Taxonomy | create/update/delete Category/Tag | `taxonomy.*` |
| Media | deleteMedia, updateMediaMeta | `media.*` |
| Leads | updateCollaborationStatus, updateContactStatus | `lead.*` |
| Public | submitCollaboration, submitContact | Turnstile + rate-limit |
| Users/RBAC | create/update/deactivateUser, updateRolePermissions | `user.*`, `role.*` |
| Settings/Nav/SEO (v1.0) | updateSettings, updateNavigation, upsertSeoMeta | `settings.*` |

**Kontrak wrapper (design-level):**
```ts
type ActionResult<T> = { ok: true; data: T } | { ok: false; error: AppError };
const createArticle = action
  .use(requireAuth)
  .use(requirePermission("article.create"))
  .input(createArticleSchema)     // Zod → sumber tipe
  .handler(async ({ input, ctx }) => { /* DAL + revalidate + log */ });
```

## Aturan lintas-endpoint
- Paginasi admin: `page`, `limit`(≤100), `sort`, `q`, `filter`; respons `meta:{page,limit,total,totalPages}`.
- Validasi Zod di client (UX) **dan** server (otoritas).
- Rate limit + idempotensi form publik (per-IP via KV).
- Revalidation ISR pada tiap mutasi konten (`revalidatePath/Tag`).
- Turnstile diverifikasi server sebelum simpan submission.
