# 01 · Analisis Bisnis & Kebutuhan Pengguna

> WalDev — Digital Studio Platform · Tagline: **Build Digital Products.**

## 1. Ringkasan Brand
WalDev adalah **studio digital** (identitas perusahaan, bukan personal). Tidak menampilkan foto/biodata/riwayat pribadi. Karakter brand: modern, premium, professional, clean, elegant, fast, trustworthy, technology-oriented.

Layanan yang dijual: Website Development, Landing Page, Company Profile, Sistem Informasi, Dashboard Admin, CMS, Web Application, AI Integration, Automation, POS, Attendance System, Digital Invitation, Internal Tools, Custom Software, Digital Consulting.

## 2. Analisis Kebutuhan Bisnis
Model bisnis = **service business** (pendapatan dari proyek klien). Fungsi utama website = **membangun kepercayaan + menghasilkan lead**, bukan transaksi.

| # | Tujuan Bisnis | Dukungan Website | Metrik |
|---|---|---|---|
| B1 | Lead berkualitas | Form Kolaborasi + CTA | Jumlah/kualitas lead, conversion rate |
| B2 | Kredibilitas & otoritas | Portfolio, Studi Kasus, Testimoni, Klien | Dwell time, scroll depth, halaman/sesi |
| B3 | Traffic organik | Blog + Knowledge Base + technical SEO | Peringkat kata kunci, traffic organik |
| B4 | Percepatan sales | Pipeline lead di CMS | Waktu respon, konversi tiap tahap |
| B5 | Brand WalDev (non-personal) | Identitas visual konsisten | Konsistensi & persepsi premium |
| B6 | Efisiensi operasional | Semua via CMS, nol edit source code | Waktu publish, ketergantungan developer |

**Nilai unik:** website WalDev *adalah* buktinya (Lighthouse ≥95, desain setara Stripe/Linear). Portofolio hidup.

**Batasan bisnis:** hormati NDA (mekanisme "Confidential Project"); zero-maintenance konten oleh developer; biaya infra rendah & terprediksi (stack Cloudflare).

## 3. Kebutuhan Pengguna

### A. Pengunjung Publik
| Persona | Konteks | Job-to-be-done | Kebutuhan |
|---|---|---|---|
| Pemilik UMKM | Awam teknis, budget terbatas | "Butuh website tapi tak paham teknis" | Bahasa sederhana, estimasi jelas, bukti nyata, kontak WhatsApp |
| Manajer Perusahaan/Startup | Semi-teknis, evaluasi vendor | "Apakah studio ini kredibel & mampu?" | Studi kasus, tech stack, testimoni, portfolio relevan |
| Instansi/Sekolah/Yayasan | Formal, butuh kepercayaan | "Apakah aman & profesional?" | Kesan formal, privacy/ToS, portfolio sektor publik |
| Profesional/Personal Brand | Paham digital | "Partner yang paham kualitas" | Desain, kecepatan, detail, blog berkualitas |

Kebutuhan lintas persona: cepat (mobile), mudah dinavigasi, social proof, jalur konversi jelas, **tanpa** tombol login/admin.

### B. Pengelola Internal
| Persona | Peran | Kebutuhan |
|---|---|---|
| Admin/Owner | Kontrol penuh | Semua modul, user & role, settings, activity log |
| Editor/Content | Kelola konten | CRUD konten & media, tanpa settings/user |
| Sales/Marketing | Kelola lead | Ubah status lead, tanpa hapus konten |

→ Dasar **RBAC**: kebutuhan tiap peran berbeda; hak akses harus granular.

**Implikasi arsitektur:** dua audiens tidak pernah tumpang tindih → memperkuat pemisahan Public vs Admin (route group, middleware, bundle terpisah).
