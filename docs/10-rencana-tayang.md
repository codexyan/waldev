# 10 · Rencana Tayang: Arsip Aplikasi ke Produksi

**Status:** Berjalan. Situs baru tayang sejak 12 September 2026 pukul 15.49 WITA, dan pada hari yang sama halaman publiknya beralih ke berkas statis (versi `5cbe6ca8`). Tersisa memutus auto-deploy (langkah 1), pengisian konten (6), pemantauan (8), dan migrasi 0003 (9) · **Dibuat:** 2026-09-12
**Terkait:** [09 · Perombakan](./09-arsip-aplikasi.md) §9 dan §11 (Tahap 5) · README bagian "Menerbitkan ke produksi"

Aturan dasar: setiap langkah yang mengubah produksi hanya dijalankan setelah pemilik menyetujui langkah itu tepat sebelum dikerjakan.

## 1. Kondisi saat ini
| Hal | Kondisi (2026-09-12, setelah halaman statis tayang) |
|---|---|
| Worker produksi | Versi `5cbe6ca8-cb37-47d5-81ce-296890099623`: situs portofolio dengan halaman publik statis |
| Kode di GitHub `main` | Tertinggal di `c68f370` (situs portofolio tanpa halaman statis). Commit sesudahnya masih lokal |
| D1 produksi | Migrasi 0000, 0001, dan 0002 sudah diterapkan; 0003 tertunda |
| Auto-deploy | Masih aktif: push ke `main` terpasang ke produksi sekitar 2,5 menit kemudian dan menimpa halaman statis |
| Konten produksi | iaUndang tayang, SIM-KGB tersembunyi. Belum ada entri WalDev, profil pembuat, maupun kalimat pengantar |

### Insiden 12 September
Commit Tahap 2–4 yang di-push ke `main` terpasang otomatis sebelum migrasi D1 diterapkan. Sejak sekitar 13.32 WITA panel produksi, dan sejak sekitar 13.52 WITA halaman publik (`/`, `/about`, `/apps/*`, `/sitemap.xml`), membalas 500 karena tabel `apps` belum ada. Situs dipulihkan sekitar 15.00 WITA dengan `wrangler rollback` ke versi 23 Agustus. Tidak ada data yang berubah atau hilang.

Penyebabnya: catatan lama menyebut push ke `main` tidak memicu deploy, dan hal itu tidak dicek ulang sebelum push.

### Perkembangan sesudahnya (12 September sore)
- Pemilik mematikan auto-deploy di dashboard, tetapi push `c68f370` pukul 15.47 WITA tetap terpasang otomatis pukul 15.49 WITA (versi `b56c7b28-03b7-466c-80d1-aba00a580819`). Karena 0001 dan 0002 sudah diterapkan lebih dulu (langkah 3), situs tidak error: situs arsip aplikasi langsung tayang dengan arsip kosong.
- Pemilik memutuskan situs baru tetap tayang. Langkah 5 (pratinjau) dan 7 (pindah trafik) tidak dipakai; konten diisi langsung di panel produksi.
- Tiga artikel contoh lama diubah menjadi draf supaya tidak tampil di `/articles`.
- Selama 0003 belum diterapkan, situs studio lama masih bisa dipulihkan dengan `npx wrangler rollback 63013654-9100-459e-8885-19472b54c50b -y`.

### Error 1102 dan halaman statis
- Saat pemilik mulai menyimpan konten, panel lalu halaman publik membalas Error 1102. `npx wrangler tail waldev --format json` menunjukkan outcome `exceededCpu`: paket Workers Free membatasi CPU 10 ms per permintaan, sedangkan render halaman Next.js memakan 230–270 ms. Data yang sedang disimpan tetap masuk.
- Pemilik memilih tetap di paket Free. Halaman publik dijadikan berkas statis yang dilayani Workers Static Assets tanpa menjalankan Worker (bagian 5). Panel tetap dirender Worker dan masih bisa terkena 1102.
- Teks publik ditulis ulang tanpa kata "saya", dengan pelaku yang disebut langsung.
- Versi `5cbe6ca8` (halaman statis dan teks baru) di-deploy 100% atas persetujuan pemilik. Sesudahnya delapan URL publik membalas 200, 20 permintaan beruntun ke `/` dan `/apps/iaundang` tidak ada yang gagal, dan respons `/` tidak lagi membawa header Next.js.
- Versi `b56c7b28` adalah situs yang sama tanpa halaman statis. Kembali ke sana berarti Error 1102 kembali, jadi pakai hanya bila semua versi statis rusak.

## 2. Prinsip
- **Menambah dulu, menghapus paling akhir.** 0001 dan 0002 hanya menambah tabel dan baris, jadi situs lama tidak terganggu dan rollback tetap mungkin. 0003 menghapus tabel lama dan dijalankan terakhir.
- **Konten disiapkan sebelum pengunjung melihat situs baru.** Versi baru diunggah sebagai pratinjau tanpa trafik. Pratinjau memakai D1 dan R2 produksi yang sama, jadi pemilik bisa mengisi konten di sana sementara situs lama tetap melayani pengunjung.
- **Kode di `main` harus selalu aman untuk skema produksi.** Karena itu 0001 dan 0002 diterapkan sebelum push berikutnya. Seandainya auto-deploy ternyata masih aktif, situs baru tayang dengan arsip kosong, bukan error.
- **Yang tayang harus hasil `pnpm terbitkan`.** Build lain tidak memuat halaman statis.

## 3. Langkah
| # | Langkah | Pelaksana | Dampak ke produksi | Bisa dibatalkan |
|---|---|---|---|---|
| 1 | Putus deploy otomatis Workers Builds | Pemilik | Pengaturan | Ya |
| 2 | Cadangkan D1 produksi | Claude | Tidak ada (hanya membaca) | – |
| 3 | Terapkan 0001 + 0002 | Claude | Menambah tabel dan baris | Ya |
| 4 | Siapkan kode untuk masa pratinjau, lalu push | Claude | Tidak ada bila auto-deploy mati | Ya |
| 5 | Unggah versi pratinjau dan uji | Claude | Versi baru, 0% trafik | Ya |
| 6 | Isi konten lewat panel | Pemilik | Data | Ya |
| 7 | Pindahkan 100% trafik ke versi baru | Claude | Situs baru tayang | Ya, lewat rollback |
| 8 | Pantau beberapa hari | Claude + pemilik | Tidak ada | – |
| 9 | Terapkan 0003 | Claude | Menghapus tabel modul jasa | **Tidak** |
| 10 | Auto-deploy tetap mati selama halaman publik dibuat lokal | Pemilik | Pengaturan | Ya |

### 1 · Putus deploy otomatis
Pengaturan yang dimatikan pemilik pada 12 September tidak menghentikan deploy: push `c68f370` tetap terpasang. Dokumentasi Workers Builds tidak menyebut tombol untuk mematikan build otomatis. Yang bisa dipakai, di Dashboard Cloudflare › Workers & Pages › `waldev` › Settings › Build:
- **Disarankan:** ganti **Deploy command** dari `npx wrangler deploy` menjadi `npx wrangler versions upload`. Push ke `main` tetap dibangun, tetapi hanya menjadi versi pratinjau tanpa trafik. Mudah dikembalikan.
- **Alternatif:** putuskan repositori lewat **Git repository › Manage**.

Cara memastikan, setelah pemilik mengabari: push berikutnya diikuti `npx wrangler deployments status` selama sekitar lima menit. Versi yang menerima 100% harus tetap versi statis terakhir. Bila berubah, segera `npx wrangler versions deploy <uuid-versi-statis>@100% -y` dan kabari pemilik.

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
Versi yang akan tayang dibuat dengan `pnpm terbitkan` (bagian 5 di bawah), bukan `pnpm cf:build` saja. Build dari Windows mengikuti README bagian "Membangun dari Windows".
```bash
pnpm terbitkan
npx wrangler versions upload
```
Keluarannya URL `https://<8-hex>-waldev.mdcodeid.workers.dev`. Cek di URL itu:
- `/`, `/about`, `/articles`, `/privacy-policy`, `/sitemap.xml`, `/panel/login` membalas 200.
- `/` membalas tanpa header `x-nextjs-*`, sedangkan `/panel/login` membawanya.

Bila `versions upload` gagal dengan "Authentication error [code: 10000]" atau "Unable to resolve Cloudflare's API hostname", ulangi saja. Pada 12 September keduanya hilang pada percobaan berikutnya.

### 6 · Isi konten (pemilik, di panel produksi)
Draf teksnya ada di `../waldev-konten/draf-konten-tayang.md` (di luar repo). Setelah konten berubah, jalankan bagian 5.
- [ ] Media: unggah foto profil dan tangkapan layar yang dibutuhkan.
- [ ] Pengaturan › Profil pembuat: nama, foto, cerita singkat.
- [ ] Pengaturan › Kalimat pengantar beranda (boleh dikosongkan).
- [ ] Aplikasi: buat entri WalDev (Sedang dibangun, Tayang) beserta catatan pertamanya.
- [ ] iaUndang dan SIM-KGB: periksa tanggal rilis, tulis ulang penjelasan dengan pelaku yang disebut langsung (tanpa kata "saya"), lalu nyalakan Tayang untuk SIM-KGB.
- [x] Tulisan: ubah 3 artikel contoh lama menjadi Draf (dihapus permanen di langkah 9).

### 7 · Pindahkan trafik
```bash
npx wrangler versions deploy <uuid-penuh>@100% -y
```
`versions deploy` hanya menerima UUID penuh. Setelahnya, ulangi pengecekan langkah 5 di alamat produksi dan buka halaman setiap aplikasi yang sudah tayang.

### 8 · Pantau
- PageSpeed Insights: target ≥ 95 di keempat kategori.
- `npx wrangler tail waldev` saat mengecek panel, untuk menangkap galat. Halaman publik statis tidak muncul di tail karena tidak menjalankan Worker.

Selama 0003 belum diterapkan, situs studio lama masih bisa dipulihkan dengan `npx wrangler rollback 63013654-9100-459e-8885-19472b54c50b -y`.

### 9 · Migrasi 0003 (tidak bisa dibatalkan)
Hanya setelah situs baru stabil beberapa hari, dan dengan persetujuan eksplisit pemilik saat itu. Pastikan `npx wrangler d1 migrations list waldev-db --remote` hanya menampilkan 0003, lalu:
```bash
npx wrangler d1 migrations apply waldev-db --remote
```
Setelah ini versi 23 Agustus tidak bisa dipakai lagi karena tabelnya sudah dihapus.

### 10 · Auto-deploy
Build di Workers Builds tidak menjalankan `pnpm terbitkan`, jadi setiap deploy dari sana menayangkan situs tanpa halaman statis dan Error 1102 kembali. Auto-deploy baru boleh dinyalakan lagi bila pembuatan halaman statis dipindah ke build CI atau Worker naik ke paket berbayar.

## 4. Jalan mundur
| Setelah langkah | Cara mundur |
|---|---|
| 3 | Tidak perlu: situs lama tidak memakai tabel baru |
| 4 | Revert commit bila bermasalah |
| 7 | Deploy ulang versi statis sebelumnya: `npx wrangler versions deploy <uuid>@100% -y`. `b56c7b28` hanya bila semua versi statis rusak (Error 1102 kembali). Situs studio lama: `npx wrangler rollback 63013654-9100-459e-8885-19472b54c50b -y` |
| 9 | Time Travel D1 ke sebelum langkah 9 (konten setelah titik itu ikut hilang), lalu rollback |

## 5. Menerbitkan halaman publik (berkas statis)
Worker di paket Free hanya boleh memakai CPU 10 ms per permintaan. Karena itu halaman publik dirender di komputer lokal lalu diunggah sebagai berkas statis. Permintaan ke berkas statis tidak menjalankan Worker dan tidak memakai kuota CPU.

Jalankan setiap kali konten publik berubah di panel (aplikasi, catatan, tulisan, pengaturan) atau kode halaman publik berubah:
```bash
pnpm terbitkan                                     # build, lalu render halaman publik dengan data produksi
npx wrangler versions upload                       # versi baru, 0% trafik
npx wrangler versions deploy <uuid-penuh>@100% -y  # tayangkan setelah pratinjau dicek
```
Tambahkan `--lewati-build` (`node scripts/terbitkan.mjs --lewati-build`) bila hanya konten yang berubah dan build terakhir masih sesuai kode.

Cara kerja `scripts/terbitkan.mjs`:
1. Build OpenNext.
2. Menyalakan `wrangler dev --config wrangler.terbit.jsonc` di port 8799. Konfigurasi ini memakai D1 dan R2 produksi (`remote: true`) dengan KV lokal, dan skripnya hanya membaca.
3. Merender `/`, `/about`, `/articles`, `/privacy-policy`, dan semua URL di sitemap, lalu menyimpannya sebagai `index.html`, `about.html`, `apps/<slug>.html`, dan seterusnya. Gambar dari `/api/media/file/...` ikut disimpan di jalur yang sama, begitu juga `sitemap.xml`, `robots.txt`, ikon, dan `_headers` (header keamanan yang sama dengan `next.config.ts`).
4. Menyalin hasilnya ke `.open-next/assets`. Proses berhenti bila ada halaman yang tidak membalas 200 atau HTML masih memuat alamat localhost.

Batasan:
- Isian panel baru tampil di situs setelah ketiga perintah di atas.
- Panel, login, dan API tetap dirender Worker, jadi masih bisa terkena Error 1102. Pada 12 September data yang disimpan tetap masuk; muat ulang dan periksa sebelum mengisi ulang.
- Tautan internal situs publik memakai `StaticLink` (`<a>` biasa), bukan `next/link`, supaya navigasi tidak meminta data RSC ke Worker.
- `pnpm deploy` dan deploy dari Workers Builds tidak menjalankan `terbitkan`, jadi hasilnya tanpa halaman statis.
