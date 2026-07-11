# 02 · Product Requirements Document (PRD)

**Versi:** 0.1 · **Tanggal:** 2026-07-11

## 1. Visi Produk
Platform digital studio yang berfungsi sebagai company website + portfolio + blog + knowledge base + mesin lead-generation + CMS/dashboard admin. Kualitas website menjadi bukti kapabilitas WalDev. Semua konten dikelola via CMS; nol editing di source code.

## 2. Tujuan & Non-Tujuan
**Goals:** G1 konversi lead · G2 kredibilitas · G3 traffic organik (SEO ≥95) · G4 CMS ber-RBAC · G5 brand non-personal.
**Non-Goals:** bukan e-commerce; tanpa akun publik; single-brand (bukan multi-tenant); layanan seperti POS/Attendance adalah *jasa yang dijual*, bukan modul di website ini.

## 3. Cakupan Fitur & Prioritas
Legenda: **M**=MVP · **S**=v1.0 · **C**=v2.0 · **W**=Future.

### Public Website
| Modul | Prioritas |
|---|---|
| Home, Portfolio (+detail), Services (+detail), Articles (+detail, kategori/tag), About, Contact, Collaboration, Privacy, ToS, 404 | M |
| Case Studies, Testimonials, Clients (logo+NDA) | S |
| Search publik | C |
| Multi-bahasa (i18n) | W |

### Admin CMS
| Modul | Prioritas |
|---|---|
| Dashboard Overview, Articles, Portfolio, Services, Media Library, Collaboration, Contact Messages, Categories, Tags, User Management, Roles & Permissions | M |
| Clients, Testimonials, SEO Manager, Navigation Menu, Site Settings, Activity Logs | S |

## 4. Metrik Sukses
- Lighthouse ≥95 (4 kategori) — gate rilis.
- Conversion rate pengunjung → lead.
- Waktu publish konten oleh non-developer (target: nol keterlibatan developer).
- Traffic organik & peringkat kata kunci (tren naik 3–6 bulan).

## 5. Asumsi & Batasan
Volume admin kecil (RBAC sederhana cukup); traffic publik menengah (D1/R2/Workers memadai & hemat); konten dominan statis/semi-statis (cocok ISR).

## 6. Di Luar Cakupan Awal
Pembayaran online, akun publik, komentar publik, notifikasi realtime, i18n penuh, PWA/offline.

## 7. Keputusan Arsitektur (terkunci)
- **Deployment:** Next.js via `@opennextjs/cloudflare` → **Cloudflare Workers** (bukan Pages).
- **Arsitektur aplikasi:** Modular Monolith (route group `(public)`/`(admin)` + middleware + API layer internal, DB sama).
- **Auth:** Better Auth (email+password, session cookie, RBAC), Drizzle + D1, admin-only.
- **Rute admin:** basis `/panel` (via env, dapat diganti, noindex).
- Pendukung: Tiptap (editor), SSG/ISR + revalidation, Cloudflare Images, Turnstile (anti-spam), Cloudflare Email/Resend (notifikasi), Zod (validasi & sumber tipe).
