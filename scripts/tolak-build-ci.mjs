/**
 * Menolak build di Workers Builds (CI Cloudflare).
 *
 * Situs publik disajikan sebagai berkas statis hasil `pnpm terbitkan` di komputer
 * lokal (docs/10 bagian 5). Build dari push ke GitHub tidak memuat berkas itu, dan
 * pada 12 September 2026 build semacam itu tetap tayang walau Deploy command di
 * dashboard sudah diganti. Karena itu skrip `build` berhenti lebih dulu bila
 * berjalan di Workers Builds, sehingga tidak ada versi yang diunggah.
 *
 * Workers Builds memasang `WORKERS_CI=1` di setiap build. Untuk mengizinkan build
 * CI lagi (misalnya setelah pembuatan halaman statis dipindah ke CI), tambahkan
 * variabel build `IZINKAN_BUILD_CI=1` di dashboard.
 */
if (process.env.WORKERS_CI === "1" && process.env.IZINKAN_BUILD_CI !== "1") {
  console.error(
    "Build dihentikan: situs ini diterbitkan dari komputer lokal lewat `pnpm terbitkan`, bukan dari Workers Builds. Lihat docs/10-rencana-tayang.md langkah 1.",
  );
  process.exit(1);
}
