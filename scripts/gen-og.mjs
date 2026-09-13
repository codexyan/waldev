/**
 * Membuat public/og.png, gambar pratinjau saat tautan situs dibagikan.
 *
 * Jalankan dari akar proyek:  node scripts/gen-og.mjs
 *
 * Catatan:
 * - Gaya mengikuti situs (Plain): kertas putih, teks hitam, satu aksen biru.
 * - sharp bukan dependensi langsung, jadi modulnya dicari di akar node_modules
 *   (susunan datar, nodeLinker: hoisted) atau di dalam store pnpm.
 * - Wajah huruf memakai font sistem (Segoe UI). Gambar dibuat sekali lalu ikut
 *   di-commit, jadi hasilnya tidak bergantung pada mesin yang membangun.
 * - Judul disalin dari HOME_INTRO (src/lib/constants.ts). Setelah domain WalDev
 *   aktif, ganti ALAMAT lalu jalankan ulang.
 */
import { existsSync, globSync } from "node:fs";
import { pathToFileURL } from "node:url";

const sharpDir = existsSync("node_modules/sharp/lib/index.js")
  ? "node_modules/sharp"
  : globSync("node_modules/.pnpm/sharp@*/node_modules/sharp")[0];
if (!sharpDir) throw new Error("Modul sharp tidak ditemukan. Jalankan pnpm install lebih dulu.");
const { default: sharp } = await import(pathToFileURL(`${sharpDir}/lib/index.js`).href);

const W = 1200;
const H = 630;
const X = 72;

// Token warna situs (lihat globals.css).
const PAPER = "#FEFEFE";
const HEADING = "#000000";
const TEXT = "#404047";
const LINE = "#E3E3E3";
const BLUE = "#155DFC";

const FONT = "Segoe UI, Arial, sans-serif";

const ALAMAT = "waldev.mdcodeid.workers.dev";
const JUDUL = ["Software house untuk", "solusi digital Anda."];
const TAGLINE = "Build Digital Products";

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAPER}"/>

  <rect x="${X}" y="84" width="12" height="12" fill="${BLUE}"/>
  <text x="${X + 24}" y="97" font-family="${FONT}" font-size="28" font-weight="700"
        letter-spacing="-0.5" fill="${HEADING}">WalDev</text>

  <text x="${X}" y="292" font-family="${FONT}" font-size="76" font-weight="700"
        letter-spacing="-2.4" fill="${HEADING}">${escape(JUDUL[0])}</text>
  <text x="${X}" y="380" font-family="${FONT}" font-size="76" font-weight="700"
        letter-spacing="-2.4" fill="${HEADING}">${escape(JUDUL[1])}</text>

  <line x1="${X}" y1="500" x2="${W - X}" y2="500" stroke="${LINE}" stroke-width="2"/>
  <text x="${X}" y="552" font-family="${FONT}" font-size="24" fill="${TEXT}">${escape(TAGLINE)}</text>
  <text x="${W - X}" y="552" text-anchor="end" font-family="${FONT}" font-size="24"
        fill="${BLUE}">${escape(ALAMAT)}</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile("public/og.png");
const meta = await sharp("public/og.png").metadata();
console.log(`og.png ${meta.width}x${meta.height}`);
