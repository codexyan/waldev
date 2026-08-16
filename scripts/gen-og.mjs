/**
 * Membuat public/og.png, gambar pratinjau saat tautan situs dibagikan.
 *
 * Jalankan dari akar proyek:  node scripts/gen-og.mjs
 *
 * Catatan:
 * - sharp bukan dependensi langsung, jadi modulnya dicari di dalam store pnpm.
 * - Lebar teks diukur lebih dulu dengan render sementara + trim, supaya sapuan
 *   stabilo di belakang kata kunci selalu pas berapa pun kalimatnya.
 * - Wajah huruf memakai font sistem (Segoe UI). Gambar dibuat sekali lalu
 *   ikut di-commit, jadi hasilnya tidak bergantung pada mesin yang membangun.
 */
import { globSync } from "node:fs";
import { pathToFileURL } from "node:url";

const [sharpDir] = globSync("node_modules/.pnpm/sharp@*/node_modules/sharp");
const { default: sharp } = await import(pathToFileURL(`${sharpDir}/lib/index.js`).href);

const W = 1200;
const H = 630;

const INK = "#0B0B0F";
const PAPER = "#FCFBF8";
const SIGNAL = "#CEF91F";
const MUTED = "#A8A8B0";

const FONT = "Segoe UI, Arial, sans-serif";
const MONO = "Consolas, Courier New, monospace";

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Mengukur lebar teks yang benar benar dirender, lewat render sementara + trim. */
async function measure(text, { size, weight = 700, tracking = 0 }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="${size * 2}">
    <text x="20" y="${size * 1.3}" font-family="${FONT}" font-size="${size}"
      font-weight="${weight}" letter-spacing="${tracking}" fill="#ffffff">${escape(text)}</text>
  </svg>`;
  const { info } = await sharp(Buffer.from(svg))
    .trim({ threshold: 1 })
    .toBuffer({ resolveWithObject: true });
  return info.width;
}

const TITLE_SIZE = 66;
const TITLE_TRACK = -2.4;

const L1 = "Kebutuhan bisnis Anda,";
const L2 = "jadi produk digital";
const L3A = "yang ";
const L3B = "bekerja.";

const wordmarkW = await measure("WalDev", { size: 26, weight: 700, tracking: -0.5 });
const fullW = await measure(L3A + L3B, { size: TITLE_SIZE, weight: 700, tracking: TITLE_TRACK });
const markedW = await measure(L3B, { size: TITLE_SIZE, weight: 700, tracking: TITLE_TRACK });

const X = 72;
const L3_BASELINE = 416;
// Sapuan stabilo: sedikit lebih lebar dari kata, menutup tinggi huruf kecil sampai atas.
const markX = X + fullW - markedW - 11;
const markW = markedW + 22;
const markY = L3_BASELINE - TITLE_SIZE + 6;
const markH = TITLE_SIZE + 12;

const grid = [];
for (let x = 0; x <= W; x += 72) {
  grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${PAPER}" stroke-opacity="0.045"/>`);
}
for (let y = 0; y <= H; y += 72) {
  grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${PAPER}" stroke-opacity="0.045"/>`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glowSignal" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${SIGNAL}" stop-opacity="0.26"/>
      <stop offset="55%" stop-color="${SIGNAL}" stop-opacity="0.09"/>
      <stop offset="100%" stop-color="${SIGNAL}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowPaper" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${PAPER}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${PAPER}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${INK}"/>
  ${grid.join("")}
  <ellipse cx="1130" cy="60" rx="430" ry="340" fill="url(#glowSignal)"/>
  <ellipse cx="40" cy="600" rx="330" ry="260" fill="url(#glowPaper)"/>

  <text x="${X}" y="96" font-family="${FONT}" font-size="26" font-weight="700"
        letter-spacing="-0.5" fill="${PAPER}">WalDev</text>
  <rect x="${X + wordmarkW + 10}" y="82" width="9" height="9" fill="${SIGNAL}"/>

  <text x="${X}" y="268" font-family="${FONT}" font-size="${TITLE_SIZE}" font-weight="700"
        letter-spacing="${TITLE_TRACK}" fill="${PAPER}">${L1}</text>
  <text x="${X}" y="342" font-family="${FONT}" font-size="${TITLE_SIZE}" font-weight="700"
        letter-spacing="${TITLE_TRACK}" fill="${PAPER}">${L2}</text>

  <rect x="${markX}" y="${markY}" width="${markW}" height="${markH}" fill="${SIGNAL}"/>
  <text x="${X}" y="${L3_BASELINE}" font-family="${FONT}" font-size="${TITLE_SIZE}" font-weight="700"
        letter-spacing="${TITLE_TRACK}" fill="${PAPER}">${L3A}<tspan fill="${INK}">${L3B}</tspan></text>

  <line x1="${X}" y1="502" x2="${W - X}" y2="502" stroke="${PAPER}" stroke-opacity="0.16"/>
  <rect x="${X}" y="541" width="9" height="9" fill="${SIGNAL}"/>
  <text x="${X + 22}" y="550" font-family="${MONO}" font-size="17" letter-spacing="3"
        fill="${MUTED}">STUDIO DIGITAL INDONESIA</text>
  <text x="${W - X}" y="550" text-anchor="end" font-family="${MONO}" font-size="17"
        letter-spacing="2" fill="${MUTED}">wolue.cloud</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile("public/og.png");
const meta = await sharp("public/og.png").metadata();
console.log(
  `og.png ${meta.width}x${meta.height} | wordmark ${wordmarkW} | full ${fullW} | marked ${markedW}`,
);
