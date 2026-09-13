# 10 · Rencana Tayang: Arsip Aplikasi ke Produksi

**Status:** Berjalan. Situs baru tayang sejak 12 September 2026 pukul 15.49 WITA. Pada hari yang sama halaman publiknya beralih ke berkas statis, lalu beranda direvisi. Sejak 13 September siang beranda memakai hero *Rakit* berlatar Cetak biru, logo klien yang muncul bertahap, kartu unggulan + grid, dan halaman `/apps`; sore harinya teks publik diganti bernada software house, lalu kontras teks pudar dan tautan situs iaUndang diperbaiki, dan halaman proyek didesain ulang (versi `a00fe854`). Malam harinya alamat email pemilik dihapus dari situs, formulir di halaman Kontak menjadi satu-satunya jalur kontak, dan halaman Tentang ditulis ulang sebagai profil software house (versi `9b510c8b`). Build dari Workers Builds diblokir di kode (langkah 1). Tersisa pengisian konten (6), pemantauan (8), dan migrasi 0003 + 0004 (9) · **Dibuat:** 2026-09-12
**Terkait:** [09 · Perombakan](./09-arsip-aplikasi.md) §9 dan §11 (Tahap 5) · README bagian "Menerbitkan ke produksi"

Aturan dasar: setiap langkah yang mengubah produksi hanya dijalankan setelah pemilik menyetujui langkah itu tepat sebelum dikerjakan.

## 1. Kondisi saat ini
| Hal | Kondisi (2026-09-13 malam, setelah formulir kontak tayang) |
|---|---|
| Worker produksi | Versi `9b510c8b-d6db-47bf-bb8a-27c8b09a096f`: formulir kontak di `/kontak` yang diterima `worker.mjs` sebelum Next.js dan disimpan ke `contact_messages` (docs/09 §5.4), tanpa alamat email pemilik di halaman mana pun, halaman Tentang berbentuk profil software house (§5.3), menu Kontak, halaman proyek susunan *Kepala terbelah* (docs/09 §5.2), token teks pudar `#737373` (WCAG AA), tautan situs iaUndang, dan teks publik bernada software house (docs/09 §15: hero "Software house untuk solusi digital Anda.", menu *Portofolio*, sudut pandang kami dan Anda, ajakan kontak), hero *Rakit* berlatar Cetak biru dengan tepi lantai memudar (docs/09 §16), gambar dan aplikasi hero dari Pengaturan, logo klien yang muncul bertahap, kartu unggulan + grid dan halaman `/apps` (§5.1), tulisan terbaru, halaman publik statis, `keep_names` mati. Versi statis sebelumnya untuk rollback: `a00fe854-8c82-477b-97a5-cb32a2d0b42f` (tanpa formulir kontak; email pemilik masih tampil), `26a0b697-9219-46e1-8fa6-7c0aee7083c7` (halaman proyek lama), `0b362be7-3d09-42b7-b813-1024fca50c65` (teks software house, kontras lama), `d059fe0f-9f95-4fd3-8755-e20c4fbec5c2` (teks sebelum revisi software house), `d1ba9430-a9f6-4601-926e-f64b5f33b893` (hero Rakit lama, kartu berlogo), lalu `144f0042-39c3-4c93-ae3d-44afcc7bcb5a` (gambar kartu lebar terpotong) dan `0f2e8ecd-b979-4cc7-9523-460b0da97bf7` (hero 3D tidak pernah dimuat di laptop pemilik). Pratinjau `12de6086-7a99-4b13-bbcb-abc7cef1e128` tidak dipakai karena garis lantai masih terpotong tepi kanvas; pratinjau `a4a5f3a4-9140-45f2-bc2e-c3b1395d56ca` tidak dipakai karena footer memuat dua tautan ke Kontak dan tombol kirim melepas fokus keyboard |
| Kode di GitHub `main` | Push terakhir `00509bb` (13 September 19.54 WITA), satu commit catatan setelah push `c8ba119` (19.42 WITA) yang berisi formulir kontak dan Tentang (`1fac356`). Selama pemantauan 19.43 sampai 19.51 WITA dan 19.54 sampai 20.02 WITA versi aktif tetap `9b510c8b`, jadi build Workers Builds tidak menayangkan apa pun. Push sebelumnya, `c20e2bf` (13 September sore), juga tidak memicu versi baru. Commit dokumen ini belum di-push. Berkas statisnya tidak disimpan di repo; dibuat saat `pnpm terbitkan` |
| D1 produksi | Migrasi 0000, 0001, 0002, dan 0005 (kolom `apps.logo_media_id`) sudah diterapkan; 0003 (direvisi) dan 0004 tertunda. 0005 diterapkan manual lewat `d1 execute --file` dan dicatat di `d1_migrations`. Bookmark Time Travel sebelum 0005: `000007e7-00000000-000050e5-45d29e800fde44cb7af328270012bb1b`. Tabel `clients` berisi satu klien sungguhan, Lapas Kelas IIB Banjarbaru, yang ditambahkan 13 September atas persetujuan pemilik. Tabel `contact_messages` (dari 0000) dipakai formulir kontak; `0006_pulihkan_pesan` hanya diperlukan di D1 lokal dan tidak mengubah apa pun di produksi. Pesan pertama di tabel itu adalah pesan uji dari Claude atas persetujuan pemilik (13 September malam, nama *Uji Claude*, email `uji@example.com`) |
| Auto-deploy | Push ke `main` tetap memicu Workers Builds, tetapi skrip `build` berhenti karena `WORKERS_CI=1`, jadi tidak ada versi yang diunggah (langkah 1) |
| Konten produksi | iaUndang tayang, SIM-KGB tersembunyi, 1 tulisan tayang, 1 klien tanpa berkas logo (tampil sebagai nama). Belum ada entri WalDev, profil pembuat, logo klien, maupun gambar hero pilihan; judul hero memakai bawaan kode. Alamat situs iaUndang dipindah dari kolom kode sumber ke tautan aplikasi pada 13 September sore, jadi halaman proyeknya menampilkan *Kunjungi situs*. Menu Pesan di panel berisi satu pesan uji yang boleh diarsipkan |

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

### Hero Cetak biru (13 September siang)
- Pemilik meminta transisi 3D yang lebih halus, latar hero yang lebih menarik, gambar hero yang bisa diganti dari panel, susunan kartu untuk banyak aplikasi, dan logo kerja sama di bawah hero (docs/09 §15).
- Build pertama dihentikan karena RAM laptop tinggal sekitar 2,8 GB saat dev server proyek lain berjalan. `pnpm terbitkan` sekarang menjalankan typecheck sendiri lalu build hemat memori (bagian 5).
- Pratinjau `12de6086` diperiksa dengan Edge headless lalu tidak dipakai: garis lantai dan bayangan terpotong lurus di tepi kanvas. Setelah diperbaiki, pratinjau `d059fe0f` lolos di tema terang, tema gelap, dan gerak dikurangi, tanpa galat konsol.
- `d059fe0f` di-deploy 100% atas persetujuan pemilik. Sesudahnya tujuh URL publik membalas 200 tanpa header Next.js, `/panel/clients` membalas 307 ke halaman login, dan 20 permintaan beruntun ke `/` serta `/apps/iaundang` membalas 200 semua.

### Teks software house (13 September sore)
- Pemilik meminta teks hero bernada software house, lalu memberi acuan gaya vodjo.com/id dan gosocial.co.id. Pilihan akhirnya dicatat di docs/09 §13 dan §15.
- Pratinjau `0b362be7` diperiksa dengan Edge headless di beranda (tema terang dan gelap), `/apps`, dan `/apps/iaundang`: tombol *Lihat portofolio* menemukan `#portofolio`, menu *Portofolio* menuju `/apps` dan menyala di halaman proyek, bagian kontak punya tombol email, dan tidak ada galat konsol.
- `0b362be7` di-deploy 100%. Sesudahnya tujuh URL publik membalas 200 tanpa header Next.js, `/panel/clients` membalas 307 ke halaman login, `og.png` baru terpasang, teks final tampil di beranda, `/apps`, Tentang, dan halaman iaUndang, dan 20 permintaan beruntun ke `/` serta `/apps/iaundang` membalas 200 semua.
- Delivery Gate antislop menemukan teks pudar tema terang hanya 2,3:1. Atas pilihan pemilik, token `--faint` digelapkan ke `#737373` (4,7:1).
- Atas pilihan pemilik, satu baris data produksi diubah: `apps.pf_iaundang` kini punya `app_url` `https://www.iaundang.online` dan `repo_url` kosong. Bookmark Time Travel sebelum perubahan: `000007f3-00000000-000050e5-9de7aadc38dea21809f9a1663aa3d250`. Kedua perbaikan tayang sebagai `26a0b697`: tujuh URL publik membalas 200 tanpa header Next.js, halaman iaUndang menampilkan *Kunjungi situs*, dan CSS memuat token baru.
- Pemilik meminta desain ulang halaman detail proyek dan memilih susunan *Kepala terbelah* (docs/09 §5.2). Pratinjau `4d9121c7` lolos cek ponsel 375 px, keyboard, dan tema terang/gelap; garis bawah ringkasan lalu diseragamkan di pratinjau `a00fe854`. `a00fe854` di-deploy 100% atas persetujuan pemilik: tujuh URL publik membalas 200 tanpa header Next.js, `/panel/clients` membalas 307 ke login, halaman iaUndang memuat susunan baru tanpa sel "Belum ada", bagian kontak beranda tetap utuh, dan 20 permintaan beruntun ke `/` serta `/apps/iaundang` membalas 200 semua.

### Formulir kontak dan Tentang (13 September malam)
- Pemilik meminta tampilan halaman Tentang diperbaiki dan alamat emailnya tidak tampil di situs; yang ingin menghubungi cukup mengisi formulir. Pilihannya: pesan masuk ke panel, halaman Kontak sendiri dengan isian nama, email, dan pesan, serta Tentang berbentuk profil software house (docs/09 §5.3, §5.4, §15).
- Kiriman formulir diterima `worker.mjs` sebelum Next.js, jadi `main` di `wrangler.jsonc` dan `wrangler.terbit.jsonc` kini `worker.mjs`. Uji di `wrangler dev` lokal lolos 12 dari 12 kasus: metode lain, asal situs lain, email salah, pesan pendek, jebakan bot, kiriman dengan dan tanpa JavaScript, serta batas 5 kiriman per jam.
- Pratinjau `a4a5f3a4` tidak dipakai: footer memuat dua tautan ke `/kontak`, tombol kirim yang dinonaktifkan melepas fokus keyboard, dan tautan Kebijakan Privasi di formulir tidak terlihat sebagai tautan.
- Pratinjau `9b510c8b` lolos: sembilan URL publik 200, tidak ada alamat email atau `mailto:` di halaman mana pun, `/panel/messages` 307 ke login, dan `/api/kontak` menolak GET (405), asal situs lain (403), serta email salah (400). Keadaan formulir (mengirim, ditolak, koneksi putus, balasan rusak, terkirim) diuji di desktop dan ponsel lewat Edge headless dengan permintaan yang dicegat, jadi pengujian itu tidak menyimpan apa pun.
- `9b510c8b` di-deploy 100% atas persetujuan pemilik pukul 19.02 WITA. Sesudahnya sembilan URL publik membalas 200 tanpa header Next.js, tidak ada halaman yang memuat email, `/contact` dialihkan 308 ke `/kontak`, dan 40 permintaan beruntun ke `/` serta `/kontak` membalas 200 semua.
- Atas pilihan pemilik, Claude mengirim satu pesan uji ke produksi dan menerima `{"ok":true}`, balasan yang hanya dikirim setelah INSERT ke `contact_messages` berhasil. Pemilik lalu memastikan pesan uji itu tampil di Panel › Pesan, jadi alur dari formulir sampai panel terbukti di produksi.
- Tidak ada email pemberitahuan saat pesan masuk; jumlah pesan baru tampil di menu Pesan.

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
Draf teksnya ada di `../waldev-konten/draf-konten-tayang.md` (di luar repo). Setelah konten berubah, jalankan bagian 5. Buka panel di Chrome atau Edge biasa: pada 12 September simpanan dari panel browser di dalam aplikasi Claude desktop menampilkan "Tersimpan ✓", tetapi permintaannya tidak pernah sampai ke Worker produksi dan database tidak berubah.
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
1. Menjalankan `pnpm typecheck`, lalu build OpenNext dengan `WALDEV_BUILD_HEMAT=1`. Di mode ini `next build` melewati pengecekan tipenya sendiri (sudah dijalankan tepat sebelumnya), memakai satu worker, dan menyalakan `webpackMemoryOptimizations` (lihat `next.config.ts`). Mode ini ditambahkan 13 September setelah build dihentikan di tahap pengecekan tipe karena RAM laptop menipis saat dev server proyek lain ikut berjalan.
2. Menyalakan `wrangler dev --config wrangler.terbit.jsonc` di port 8799. Konfigurasi ini memakai D1 dan R2 produksi (`remote: true`) dengan KV lokal, dan skripnya hanya membaca.
3. Merender `/`, `/apps`, `/about`, `/kontak`, `/kontak/terkirim`, `/kontak/gagal`, `/articles`, `/privacy-policy`, dan semua URL di sitemap, lalu menyimpannya sebagai `index.html`, `apps.html`, `about.html`, `apps/<slug>.html`, dan seterusnya. Gambar dari `/api/media/file/...` ikut disimpan di jalur yang sama, begitu juga `sitemap.xml`, `robots.txt`, ikon, dan `_headers` (header keamanan yang sama dengan `next.config.ts`).
4. Menyalin hasilnya ke `.open-next/assets`. Proses berhenti bila ada halaman yang tidak membalas 200 atau HTML masih memuat alamat localhost.

Batasan:
- Isian panel baru tampil di situs setelah ketiga perintah di atas.
- Panel, login, dan API tetap dirender Worker, jadi masih bisa terkena Error 1102. Pada 12 September data yang disimpan tetap masuk; muat ulang dan periksa sebelum mengisi ulang.
- Tautan internal situs publik memakai `StaticLink` (`<a>` biasa), bukan `next/link`, supaya navigasi tidak meminta data RSC ke Worker.
- `keep_names` dimatikan di `wrangler.jsonc` dan `wrangler.terbit.jsonc`. Tanpa itu esbuild di Wrangler menyisipkan `__name(...)` ke skrip tema next-themes di HTML, dan browser melempar `ReferenceError: __name is not defined` (terlihat di produksi pada 13 September).
- `pnpm deploy` tidak menjalankan `terbitkan`, jadi hasilnya tanpa halaman statis. Build di Workers Builds sengaja digagalkan (langkah 1).
