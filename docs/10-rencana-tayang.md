# 10 · Rencana Tayang: Arsip Aplikasi ke Produksi

**Status:** Berjalan. Situs baru tayang sejak 12 September 2026 pukul 15.49 WITA. Pada hari yang sama halaman publiknya beralih ke berkas statis, lalu beranda direvisi (versi `3587a5e8`). Build dari Workers Builds diblokir di kode (langkah 1). Tersisa pengisian konten (6), pemantauan (8), dan migrasi 0003 + 0004 (9) · **Dibuat:** 2026-09-12
**Terkait:** [09 · Perombakan](./09-arsip-aplikasi.md) §9 dan §11 (Tahap 5) · README bagian "Menerbitkan ke produksi"

Aturan dasar: setiap langkah yang mengubah produksi hanya dijalankan setelah pemilik menyetujui langkah itu tepat sebelum dikerjakan.

## 1. Kondisi saat ini
| Hal | Kondisi (2026-09-12 malam, setelah revisi beranda tayang) |
|---|---|
| Worker produksi | Versi `3587a5e8-7507-40e8-bca4-f7f2c9653b7e`: beranda baru (hero, logo klien, daftar aplikasi, tulisan terbaru), menu Klien di panel, halaman publik statis. Versi statis sebelumnya: `5cbe6ca8-cb37-47d5-81ce-296890099623` |
| Kode di GitHub `main` | Tertinggal dari kode lokal (`0c4bc99`, `97f1a90`, `e206375`, dan commit dokumen ini belum di-push). Berkas statisnya tidak disimpan di repo; dibuat saat `pnpm terbitkan` |
| D1 produksi | Migrasi 0000, 0001, dan 0002 sudah diterapkan; 0003 (direvisi) dan 0004 tertunda. Tabel `clients` masih ada dan kosong setelah 3 klien contoh dihapus |
| Auto-deploy | Push ke `main` tetap memicu Workers Builds, tetapi skrip `build` berhenti karena `WORKERS_CI=1`, jadi tidak ada versi yang diunggah (langkah 1) |
| Konten produksi | iaUndang tayang, SIM-KGB tersembunyi, 1 tulisan tayang, belum ada klien. Belum ada entri WalDev, profil pembuat, maupun kalimat pengantar |

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
- Pemilik mengganti Deploy command menjadi `npx wrangler versions upload`, lalu `22352fc` di-push pukul 20.55 WITA. Build tetap tayang: versi `b5bec1b0-05c9-4f2d-a8ac-b5471ca43282` diunggah pukul 20.56.49 WITA dan di-deploy 100% dua detik kemudian. Pemantau push mengembalikan `5cbe6ca8` pukul 20.57.30 WITA, jadi versi tanpa halaman statis melayani sekitar 39 detik. Log build berikutnya menunjukkan Build command di Workers Builds adalah `pnpm run cf:build`, yang hanya membangun. Bila pengaturannya sama saat push `22352fc`, deploy itu datang dari langkah Deploy command walau sudah diganti; penyebabnya belum dipastikan.
- Sebagai gantinya, skrip `build` diberi pengaman yang menghentikan build di Workers Builds (langkah 1). Terbukti pada push `f80196c`: log build `a305eac6-e14f-460e-b484-19bd837c0652` pukul 21.10 WITA memuat pesan "Build dihentikan: …" dari `scripts/tolak-build-ci.mjs`, lalu Workers Builds berhenti dengan "Failed: error occurred while running build command" dan tidak ada versi baru.

## 2. Prinsip
- **Menambah dulu, menghapus paling akhir.** 0001 dan 0002 hanya menambah tabel dan baris, jadi situs lama tidak terganggu dan rollback tetap mungkin. 0003 menghapus tabel lama dan dijalankan terakhir.
- **Konten disiapkan sebelum pengunjung melihat situs baru.** Versi baru diunggah sebagai pratinjau tanpa trafik. Pratinjau memakai D1 dan R2 produksi yang sama, jadi pemilik bisa mengisi konten di sana sementara situs lama tetap melayani pengunjung.
- **Kode di `main` harus selalu aman untuk skema produksi.** Karena itu 0001 dan 0002 diterapkan sebelum push berikutnya. Seandainya auto-deploy ternyata masih aktif, situs baru tayang dengan arsip kosong, bukan error.
- **Yang tayang harus hasil `pnpm terbitkan`.** Build lain tidak memuat halaman statis.
- **Setiap push dipantau.** Cek versi aktif selama sekitar lima menit dan siap mengembalikan versi statis.

## 3. Langkah
| # | Langkah | Pelaksana | Dampak ke produksi | Bisa dibatalkan |
|---|---|---|---|---|
| 1 | Blokir deploy dari Workers Builds | Claude | Build CI gagal | Ya |
| 2 | Cadangkan D1 produksi | Claude | Tidak ada (hanya membaca) | – |
| 3 | Terapkan 0001 + 0002 | Claude | Menambah tabel dan baris | Ya |
| 4 | Siapkan kode untuk masa pratinjau, lalu push | Claude | Tidak ada bila auto-deploy mati | Ya |
| 5 | Unggah versi pratinjau dan uji | Claude | Versi baru, 0% trafik | Ya |
| 6 | Isi konten lewat panel | Pemilik | Data | Ya |
| 7 | Pindahkan 100% trafik ke versi baru | Claude | Situs baru tayang | Ya, lewat rollback |
| 8 | Pantau beberapa hari | Claude + pemilik | Tidak ada | – |
| 9 | Terapkan 0003 | Claude | Menghapus tabel modul jasa | **Tidak** |
| 10 | Pengaman build CI tetap terpasang selama halaman publik dibuat lokal | Claude + pemilik | Tidak ada | Ya |

### 1 · Blokir deploy dari Workers Builds
Dua cara lewat dashboard tidak menghentikan deploy: pengaturan yang dimatikan pemilik pada 12 September siang, lalu mengganti **Deploy command** menjadi `npx wrangler versions upload` pada malam harinya. Dokumentasi Workers Builds juga tidak menyebut tombol untuk mematikan build otomatis.

Karena itu pengamannya dipasang di kode. Skrip `build` di `package.json` menjalankan `scripts/tolak-build-ci.mjs` lebih dulu. Workers Builds memasang variabel `WORKERS_CI=1` di setiap build, dan bila variabel itu ada, skrip berhenti dengan galat sebelum `next build` berjalan. OpenNext memanggil skrip `build` ini, jadi build di Cloudflare gagal sebelum ada versi yang diunggah, apa pun isi Build command dan Deploy command. Build lokal, `pnpm terbitkan`, dan `pnpm dev` tidak terpengaruh.

Konsekuensinya, setiap push tercatat sebagai build gagal di dashboard Cloudflare.

Cara memastikan setelah push: pantau `npx wrangler deployments status` dan `npx wrangler versions list` selama sekitar lima menit. Tidak boleh ada versi baru, dan versi yang menerima 100% tetap versi statis terakhir. Bila berubah, segera `npx wrangler versions deploy <uuid-versi-statis>@100% -y`.

Cara yang lebih tuntas, dilakukan pemilik: cabut akses aplikasi GitHub Cloudflare Workers and Pages ke repo `codexyan/waldev` (GitHub › Settings › Applications).

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

### 9 · Migrasi 0003 + 0004 (0003 tidak bisa dibatalkan)
Hanya setelah situs baru stabil beberapa hari, dan dengan persetujuan eksplisit pemilik saat itu. 0003 direvisi pada 12 September malam, sebelum pernah diterapkan di produksi: tabel `clients`, izin `client.manage`, dan artikel contoh yang sedang tayang tidak lagi dihapus. 0004 membuat tabel `clients` dengan `IF NOT EXISTS`, jadi di produksi tidak mengubah apa pun (docs/09 §9.2). Pastikan `npx wrangler d1 migrations list waldev-db --remote` hanya menampilkan 0003 dan 0004, lalu:
```bash
npx wrangler d1 migrations apply waldev-db --remote
```
Setelah ini versi 23 Agustus tidak bisa dipakai lagi karena tabelnya sudah dihapus.

### 10 · Pengaman build CI
Build di Workers Builds tidak menjalankan `pnpm terbitkan`, jadi setiap deploy dari sana menayangkan situs tanpa halaman statis dan Error 1102 kembali. Pengaman di langkah 1 baru boleh dilepas bila pembuatan halaman statis dipindah ke build CI atau Worker naik ke paket berbayar. Caranya: tambahkan variabel `IZINKAN_BUILD_CI=1` di Settings › Build › Build variables and secrets, atau hapus pemanggilan `scripts/tolak-build-ci.mjs` dari skrip `build`.

## 4. Jalan mundur
| Setelah langkah | Cara mundur |
|---|---|
| 1 | Hapus pemanggilan `scripts/tolak-build-ci.mjs` dari skrip `build` |
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
`--lewati-build` (`node scripts/terbitkan.mjs --lewati-build`) hanya untuk mengulang render yang gagal tepat setelah build. Setelah penerbitan berhasil, `.open-next/assets` berisi halaman statis yang dilayani lebih dulu oleh `wrangler dev`, jadi perubahan konten wajib lewat build penuh. Skrip menolak `--lewati-build` selama `index.html` hasil render lama masih ada.

Cara kerja `scripts/terbitkan.mjs`:
1. Build OpenNext.
2. Menyalakan `wrangler dev --config wrangler.terbit.jsonc` di port 8799. Konfigurasi ini memakai D1 dan R2 produksi (`remote: true`) dengan KV lokal, dan skripnya hanya membaca.
3. Merender `/`, `/about`, `/articles`, `/privacy-policy`, dan semua URL di sitemap, lalu menyimpannya sebagai `index.html`, `about.html`, `apps/<slug>.html`, dan seterusnya. Gambar dari `/api/media/file/...` ikut disimpan di jalur yang sama, begitu juga `sitemap.xml`, `robots.txt`, ikon, dan `_headers` (header keamanan yang sama dengan `next.config.ts`).
4. Menyalin hasilnya ke `.open-next/assets`. Proses berhenti bila ada halaman yang tidak membalas 200 atau HTML masih memuat alamat localhost.

Batasan:
- Isian panel baru tampil di situs setelah ketiga perintah di atas.
- Panel, login, dan API tetap dirender Worker, jadi masih bisa terkena Error 1102. Pada 12 September data yang disimpan tetap masuk; muat ulang dan periksa sebelum mengisi ulang.
- Tautan internal situs publik memakai `StaticLink` (`<a>` biasa), bukan `next/link`, supaya navigasi tidak meminta data RSC ke Worker.
- `pnpm deploy` tidak menjalankan `terbitkan`, jadi hasilnya tanpa halaman statis. Build di Workers Builds sengaja digagalkan (langkah 1).
