/**
 * Render halaman publik WalDev menjadi berkas statis di .open-next/assets.
 *
 *   node scripts/terbitkan.mjs                 # build OpenNext, lalu render
 *   node scripts/terbitkan.mjs --lewati-build  # ulangi render yang gagal, tanpa build ulang
 *
 * Kenapa: Worker produksi ada di paket Workers Free yang membatasi CPU 10 ms per
 * permintaan, sedangkan satu halaman Next.js di situs ini butuh sekitar 250 ms. Permintaan
 * yang cocok dengan berkas di Workers Static Assets dilayani tanpa menjalankan Worker, jadi
 * halaman publik dirender di komputer ini (tanpa batas CPU) memakai data produksi, lalu
 * disimpan sebagai berkas statis. Panel dan API tetap dilayani Worker.
 *
 * `--lewati-build` hanya aman tepat setelah build yang render-nya gagal. Setelah penerbitan
 * berhasil, halaman statis hasil render ada di .open-next/assets dan dilayani lebih dulu oleh
 * wrangler dev, sehingga render tanpa build hanya menyalin halaman lama. Karena itu skrip
 * menolak `--lewati-build` selama index.html lama masih ada; build baru membersihkannya.
 *
 * Sebelum build, skrip menjalankan `pnpm typecheck` sendiri, lalu membangun dengan
 * WALDEV_BUILD_HEMAT=1 (lihat next.config.ts): pengecekan tipe bawaan `next build` dilewati
 * karena sudah dijalankan, dan worker dikurangi supaya puncak memorinya lebih rendah.
 *
 * Skrip ini hanya MEMBACA D1 dan R2 produksi (lihat wrangler.terbit.jsonc) dan tidak
 * men-deploy apa pun. Hasilnya baru tayang setelah diunggah (`npx wrangler versions upload`)
 * dan versinya dipasang.
 */
import { spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { setTimeout as tunggu } from "node:timers/promises";

const AKAR = process.cwd();
const ASSETS = join(AKAR, ".open-next", "assets");
const PORT = 8799;
const LOKAL = `http://127.0.0.1:${PORT}`;
const WINDOWS = process.platform === "win32";

/** Halaman yang selalu ada. Halaman aplikasi dan tulisan diambil dari sitemap. */
const HALAMAN_TETAP = [
  "/",
  "/apps",
  "/about",
  "/kontak",
  "/kontak/terkirim",
  "/kontak/gagal",
  "/articles",
  "/privacy-policy",
];

/** Sama dengan securityHeaders di next.config.ts, karena berkas statis tidak melewati Next. */
const HEADER_KEAMANAN = `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  X-DNS-Prefetch-Control: on
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
`;

function jalankan(perintah, argumen, envTambahan = {}) {
  const hasil = spawnSync(perintah, argumen, {
    stdio: "inherit",
    shell: WINDOWS,
    env: { ...process.env, ...envTambahan },
  });
  if (hasil.status !== 0) {
    throw new Error(`${perintah} ${argumen.join(" ")} gagal (kode ${hasil.status}).`);
  }
}

/** `/` → index.html, `/apps/iaundang` → apps/iaundang.html (aturan html_handling bawaan). */
function berkasUntuk(path) {
  return path === "/" ? "index.html" : `${path.replace(/^\/+|\/+$/g, "")}.html`;
}

async function ambil(path) {
  const res = await fetch(LOKAL + path, { redirect: "manual" });
  if (res.status !== 200) {
    throw new Error(`${path} membalas ${res.status}. Penerbitan dibatalkan supaya tidak setengah jadi.`);
  }
  return res;
}

async function tungguSiap(proses, log) {
  for (let detik = 0; detik < 180; detik++) {
    if (proses.exitCode !== null) {
      throw new Error(`wrangler dev berhenti sebelum siap:\n${log.join("").slice(-3000)}`);
    }
    try {
      const res = await fetch(`${LOKAL}/robots.txt`);
      if (res.ok) return;
    } catch {
      // belum menerima koneksi
    }
    await tunggu(1000);
  }
  throw new Error(`wrangler dev belum siap setelah 3 menit:\n${log.join("").slice(-3000)}`);
}

function hentikan(proses) {
  if (!proses || proses.exitCode !== null) return;
  if (WINDOWS) {
    spawnSync("taskkill", ["/pid", String(proses.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    proses.kill("SIGTERM");
  }
}

async function render(staging) {
  const tulis = (relatif, isi) => {
    const tujuan = join(staging, ...relatif.split("/"));
    mkdirSync(dirname(tujuan), { recursive: true });
    writeFileSync(tujuan, isi);
  };

  const sitemap = await (await ambil("/sitemap.xml")).text();
  const dariSitemap = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname,
  );
  const halaman = [...new Set([...HALAMAN_TETAP, ...dariSitemap])];

  const media = new Set();
  for (const path of halaman) {
    const res = await ambil(path);
    const tipe = res.headers.get("content-type") ?? "";
    if (!tipe.includes("text/html")) throw new Error(`${path} bukan HTML (${tipe}).`);
    const html = await res.text();
    if (html.includes(`127.0.0.1:${PORT}`) || html.includes(`localhost:${PORT}`)) {
      throw new Error(`${path} memuat alamat lokal. Periksa NEXT_PUBLIC_SITE_URL saat build.`);
    }
    for (const m of html.matchAll(/\/api\/media\/file\/[^"'\s<>)\\]+/g)) media.add(m[0]);
    tulis(berkasUntuk(path), html);
    console.log(`  halaman  ${path}`);
  }

  // Gambar disimpan di alamat yang sama dengan rute media, jadi HTML tidak perlu diubah:
  // berkas statis yang cocok dilayani lebih dulu tanpa menjalankan Worker.
  for (const path of media) {
    const res = await ambil(path);
    tulis(decodeURIComponent(path.slice(1)), Buffer.from(await res.arrayBuffer()));
    console.log(`  media    ${path}`);
  }

  tulis("sitemap.xml", sitemap);
  tulis("robots.txt", await (await ambil("/robots.txt")).text());
  const ikon = Buffer.from(await (await ambil("/icon.png")).arrayBuffer());
  tulis("icon.png", ikon);
  // Tanpa berkas ini, setiap permintaan /favicon.ico dari browser menjalankan Worker.
  tulis("favicon.ico", ikon);
  tulis("_headers", HEADER_KEAMANAN);

  return { halaman: halaman.length, media: media.size };
}

async function main() {
  const lewatiBuild = process.argv.includes("--lewati-build");
  if (!lewatiBuild) {
    jalankan("pnpm", ["run", "typecheck"]);
    jalankan("pnpm", ["run", "cf:build"], { WALDEV_BUILD_HEMAT: "1" });
  }
  if (!existsSync(join(ASSETS, "BUILD_ID"))) {
    throw new Error("Hasil build OpenNext tidak ditemukan. Jalankan tanpa --lewati-build.");
  }
  if (lewatiBuild && existsSync(join(ASSETS, "index.html"))) {
    throw new Error(
      "Hasil render sebelumnya masih ada di .open-next/assets dan akan dilayani sebagai halaman lama. Jalankan tanpa --lewati-build.",
    );
  }

  console.log("Menyalakan wrangler dev dengan D1 dan R2 produksi (hanya dibaca)…");
  const log = [];
  const dev = spawn(
    "npx",
    [
      "wrangler",
      "dev",
      "--config",
      "wrangler.terbit.jsonc",
      "--ip",
      "127.0.0.1",
      "--port",
      String(PORT),
      "--show-interactive-dev-session=false",
    ],
    { shell: WINDOWS, stdio: ["ignore", "pipe", "pipe"] },
  );
  dev.stdout.on("data", (d) => log.push(String(d)));
  dev.stderr.on("data", (d) => log.push(String(d)));

  // Hasil ditulis ke folder sementara dulu. Menulis langsung ke .open-next/assets saat
  // wrangler dev masih jalan bisa memicu muat ulang di tengah render.
  const staging = mkdtempSync(join(tmpdir(), "waldev-terbit-"));
  let hasil;
  try {
    await tungguSiap(dev, log);
    console.log("Merender halaman publik:");
    hasil = await render(staging);
  } finally {
    hentikan(dev);
  }

  cpSync(staging, ASSETS, { recursive: true });
  rmSync(staging, { recursive: true, force: true });

  console.log(
    `\nSelesai: ${hasil.halaman} halaman dan ${hasil.media} berkas media disalin ke .open-next/assets.`,
  );
  console.log(
    "Langkah berikutnya: npx wrangler versions upload, periksa URL pratinjaunya, lalu npx wrangler versions deploy <uuid-penuh>@100% -y",
  );
}

main().catch((galat) => {
  console.error(`\nPenerbitan gagal: ${galat.message}`);
  process.exit(1);
});
