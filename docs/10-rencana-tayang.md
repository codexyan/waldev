# 10 · Rencana Tayang: Arsip Aplikasi ke Produksi

**Status:** Draf, menunggu persetujuan pemilik · **Tanggal:** 2026-09-12
**Terkait:** [09 · Perombakan](./09-arsip-aplikasi.md) §9 dan §11 (Tahap 5)

Aturan dasar: setiap langkah yang mengubah produksi hanya dijalankan setelah pemilik menyetujui langkah itu tepat sebelum dikerjakan.

## 1. Kondisi saat ini
| Hal | Kondisi (2026-09-12 sore) |
|---|---|
| Worker produksi | Versi `63013654-9100-459e-8885-19472b54c50b` (23 Agustus, situs studio lama), hasil rollback |
| Kode di `main` | Sudah berisi arsip aplikasi (Tahap 1–4) |
| D1 produksi | Baru migrasi `0000`: tabel `apps` belum ada, tabel modul jasa masih ada |
| Auto-deploy | Aktif: push ke `main` terpasang ke produksi sekitar 2,5 menit kemudian. Pemilik mematikannya (langkah 1) |
| Konten produksi | Belum ada entri WalDev, profil pembuat, maupun kalimat pengantar |

### Insiden 12 September
Commit Tahap 2–4 yang di-push ke `main` terpasang otomatis sebelum migrasi D1 diterapkan. Sejak sekitar 13.32 WITA panel produksi, dan sejak sekitar 13.52 WITA halaman publik (`/`, `/about`, `/apps/*`, `/sitemap.xml`), membalas 500 karena tabel `apps` belum ada. Situs dipulihkan sekitar 15.00 WITA dengan `wrangler rollback` ke versi 23 Agustus. Tidak ada data yang berubah atau hilang.

Penyebabnya: catatan lama menyebut push ke `main` tidak memicu deploy, dan hal itu tidak dicek ulang sebelum push.

## 2. Prinsip
- **Menambah dulu, menghapus paling akhir.** 0001 dan 0002 hanya menambah tabel dan baris, jadi situs lama tidak terganggu dan rollback tetap mungkin. 0003 menghapus tabel lama dan dijalankan terakhir.
- **Konten disiapkan sebelum pengunjung melihat situs baru.** Versi baru diunggah sebagai pratinjau tanpa trafik. Pratinjau memakai D1 dan R2 produksi yang sama, jadi pemilik bisa mengisi konten di sana sementara situs lama tetap melayani pengunjung.
- **Kode di `main` harus selalu aman untuk skema produksi.** Karena itu 0001 dan 0002 diterapkan sebelum push berikutnya. Seandainya auto-deploy ternyata masih aktif, situs baru tayang dengan arsip kosong, bukan error.

## 3. Langkah
| # | Langkah | Pelaksana | Dampak ke produksi | Bisa dibatalkan |
|---|---|---|---|---|
| 1 | Matikan build otomatis Workers | Pemilik | Pengaturan | Ya |
| 2 | Cadangkan D1 produksi | Claude | Tidak ada (hanya membaca) | – |
| 3 | Terapkan 0001 + 0002 | Claude | Menambah tabel dan baris | Ya |
| 4 | Siapkan kode untuk masa pratinjau, lalu push | Claude | Tidak ada bila auto-deploy mati | Ya |
| 5 | Unggah versi pratinjau dan uji | Claude | Versi baru, 0% trafik | Ya |
| 6 | Isi konten lewat panel pratinjau | Pemilik | Data | Ya |
| 7 | Pindahkan 100% trafik ke versi baru | Claude | Situs baru tayang | Ya, lewat rollback |
| 8 | Pantau beberapa hari | Claude + pemilik | Tidak ada | – |
| 9 | Terapkan 0003 | Claude | Menghapus tabel modul jasa | **Tidak** |
| 10 | Nyalakan lagi auto-deploy bila diinginkan | Pemilik | Pengaturan | Ya |

### 1 · Matikan build otomatis
Dashboard Cloudflare › Workers & Pages › `waldev` › Settings › Build: matikan deploy otomatis untuk branch `main`, atau putuskan sambungan Git. Pemilik mengabari setelah selesai.

### 2 · Cadangan
Buat folder `../waldev-cadangan` di luar repo lebih dulu, supaya cadangan tidak ikut ter-commit.
```bash
npx wrangler d1 export waldev-db --remote --output ../waldev-cadangan/waldev-db-sebelum-tayang.sql
```
D1 juga punya Time Travel (`npx wrangler d1 time-travel info waldev-db`) untuk memulihkan database ke titik waktu tertentu.

### 3 · Migrasi 0001 + 0002
`wrangler d1 migrations apply` tidak dipakai di sini karena selalu menerapkan semua migrasi yang tertunda, termasuk 0003.
```bash
npx wrangler d1 execute waldev-db --remote --file drizzle/0001_arsip_aplikasi.sql
npx wrangler d1 execute waldev-db --remote --file drizzle/0002_salin_karya.sql
npx wrangler d1 execute waldev-db --remote --command "INSERT INTO d1_migrations (name) VALUES ('0001_arsip_aplikasi.sql'), ('0002_salin_karya.sql')"
```
Periksa sesudahnya:
- `npx wrangler d1 migrations list waldev-db --remote` tinggal menampilkan 0003.
- Tabel `apps` berisi iaUndang dan SIM-KGB, berstatus Rilis dan tersembunyi.
- Situs lama tetap membalas 200.

### 4 · Kode untuk masa pratinjau
Selama langkah 5–6, versi lama dan versi baru berjalan bersamaan di atas D1 dan KV yang sama. Dua hal perlu disiapkan lebih dulu:
- **Login di URL pratinjau.** Tambahkan pola `https://*-waldev.mdcodeid.workers.dev` ke `trustedOrigins` di `src/server/auth/config.ts`. Better Auth 1.6 mendukung pola wildcard. Tanpa ini, login di pratinjau ditolak pemeriksaan CSRF.
- **Cache pengaturan terpisah.** Kedua versi menyimpan pengaturan di kunci KV `cache:site-settings`, padahal nilai bawaannya berbeda: tagline dan deskripsi berubah, dan versi lama tidak mengenal kunci profil pembuat. Tanpa pemisahan, situs lama bisa sempat menampilkan tagline baru, dan halaman Tentang di pratinjau bisa error karena `owner_name` tidak ada. Versi baru memakai kunci sendiri (`cache:site-settings:v2`) dan selalu menggabungkan isi cache dengan nilai bawaan.
- **Nilai bawaan tidak dibekukan.** Menyimpan formulir Pengaturan dulu menulis semua isian ke database, termasuk tagline dan deskripsi bawaan versi baru, sehingga situs lama ikut menampilkannya. Sekarang nilai yang sama dengan bawaan kode tidak disimpan, dan barisnya dihapus.

Lalu typecheck, lint, build, commit, dan push. Lima menit setelah push, `npx wrangler deployments list` tidak boleh memuat deployment baru. Bila ternyata ada, langsung rollback dan kabari pemilik.

### 5 · Versi pratinjau
Build dari Windows mengikuti README bagian "Membangun dari Windows".
```bash
pnpm cf:build
npx wrangler versions upload
```
Keluarannya URL `https://<8-hex>-waldev.mdcodeid.workers.dev`. Cek di URL itu:
- `/`, `/about`, `/articles`, `/privacy-policy`, `/sitemap.xml`, `/panel/login` membalas 200.
- `/portfolio` membalas 308 ke `/`.

### 6 · Isi konten (pemilik, di panel pratinjau)
- [ ] Media: unggah foto profil dan tangkapan layar yang dibutuhkan.
- [ ] Pengaturan › Profil pembuat: nama, foto, cerita singkat.
- [ ] Pengaturan › Kalimat pengantar beranda (boleh dikosongkan).
- [ ] Aplikasi: buat entri WalDev (Sedang dibangun, Tayang) beserta catatan pertamanya.
- [ ] iaUndang dan SIM-KGB: isi tanggal rilis, tulis ulang penjelasan dengan suara "saya", lalu nyalakan Tayang.
- [ ] Tulisan: ubah 3 artikel contoh lama menjadi Draf (dihapus permanen di langkah 9).
- [ ] Jangan ubah Nama brand, Tagline, atau Deskripsi sebelum langkah 7, karena situs lama ikut membacanya.

### 7 · Pindahkan trafik
```bash
npx wrangler versions deploy <uuid-penuh>@100% -y
```
`versions deploy` hanya menerima UUID penuh. Setelahnya, ulangi pengecekan langkah 5 di alamat produksi dan buka halaman setiap aplikasi yang sudah tayang.

### 8 · Pantau
- PageSpeed Insights: target ≥ 95 di keempat kategori.
- `npx wrangler tail waldev` saat mengecek halaman, untuk menangkap galat.

Selama 0003 belum diterapkan, jalan mundurnya tetap `npx wrangler rollback 63013654-9100-459e-8885-19472b54c50b -y`.

### 9 · Migrasi 0003 (tidak bisa dibatalkan)
Hanya setelah situs baru stabil beberapa hari, dan dengan persetujuan eksplisit pemilik saat itu. Pastikan `npx wrangler d1 migrations list waldev-db --remote` hanya menampilkan 0003, lalu:
```bash
npx wrangler d1 migrations apply waldev-db --remote
```
Setelah ini versi 23 Agustus tidak bisa dipakai lagi karena tabelnya sudah dihapus.

### 10 · Auto-deploy
Setelah 0003, kode di `main` sama dengan produksi dan aman untuk skemanya. Auto-deploy boleh dinyalakan lagi, dengan aturan: push ke `main` berarti tayang.

## 4. Jalan mundur
| Setelah langkah | Cara mundur |
|---|---|
| 3 | Tidak perlu: situs lama tidak memakai tabel baru |
| 4 | Revert commit bila bermasalah |
| 7 | `npx wrangler rollback 63013654-9100-459e-8885-19472b54c50b -y` |
| 9 | Time Travel D1 ke sebelum langkah 9 (konten setelah titik itu ikut hilang), lalu rollback |
