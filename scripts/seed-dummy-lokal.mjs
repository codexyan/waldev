/**
 * Mengisi D1 LOKAL dengan data contoh supaya beranda tampil utuh saat dikembangkan.
 *
 *   node scripts/seed-dummy-lokal.mjs           # isi data contoh
 *   node scripts/seed-dummy-lokal.mjs --bersih  # kembalikan ke keadaan kosong
 *
 * ============================ PERINGATAN ============================
 * SELURUH nilai di bawah ini FIKTIF dan hanya untuk pengembangan lokal.
 *
 * Skrip ini SELALU memakai flag `--local`, jadi secara teknis tidak bisa
 * menyentuh database produksi. Jangan pernah menyalin nilainya ke Site
 * Settings produksi:
 *
 *   - Nomor WhatsApp di bawah bukan milik siapa pun yang Anda kenal. Bila
 *     tayang di situs live, pengunjung akan mengirim pesan ke orang asing.
 *   - Angka harga hanyalah pengisi tata letak, bukan penawaran. Menayangkannya
 *     berarti berjanji kepada calon klien atas angka yang belum Anda setujui.
 *   - Testimoni yang diterbitkan di sini adalah teks contoh dari seed, bukan
 *     tulisan klien sungguhan.
 *
 * Isi nilai sebenarnya lewat panel admin (/panel/settings, /panel/services,
 * /panel/testimonials) sebelum deploy.
 * ====================================================================
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const bersih = process.argv.includes("--bersih");

/** Nomor contoh. Pola 628111111111 dipilih karena langsung terbaca palsu. */
const WHATSAPP_CONTOH = "628111111111";

/** Harga contoh, diselaraskan dengan rentang anggaran di formulir kolaborasi. */
const HARGA_CONTOH = [
  ["landing-page-company-profile", "Mulai Rp3jt"],
  ["website-development", "Mulai Rp5jt"],
  ["ai-integration-automation", "Mulai Rp8jt"],
  ["dashboard-admin-panel", "Mulai Rp12jt"],
  ["sistem-informasi", "Mulai Rp20jt"],
  ["custom-software-consulting", "Mulai Rp35jt"],
];

/**
 * Dijalankan lewat berkas .sql, bukan --command: di Windows, argumen berisi
 * spasi dan tanda kutip terpecah menjadi banyak argumen sebelum sampai ke
 * wrangler, dan seluruh pernyataan gagal diurai.
 */
function jalankanSql(pernyataan) {
  const berkas = join(mkdtempSync(join(tmpdir(), "waldev-seed-")), "seed.sql");
  writeFileSync(berkas, pernyataan.join(";\n") + ";\n", "utf8");

  const hasil = spawnSync(
    "npx",
    ["wrangler", "d1", "execute", "waldev-db", "--local", "--file", berkas],
    { encoding: "utf8", shell: process.platform === "win32" },
  );
  if (hasil.status !== 0) {
    console.error(hasil.stderr || hasil.stdout);
    throw new Error("Gagal menjalankan SQL. Lihat keluaran wrangler di atas.");
  }
}

/** Cache Site Settings di KV bertahan 300 detik; harus dibuang agar perubahan langsung terlihat. */
function hapusCacheSettings() {
  spawnSync(
    "npx",
    ["wrangler", "kv", "key", "delete", "--binding", "CACHE_KV", "--local", "cache:site-settings"],
    { encoding: "utf8", shell: process.platform === "win32" },
  );
}

const kutip = (nilai) => `'${String(nilai).replace(/'/g, "''")}'`;

if (bersih) {
  jalankanSql([
    "DELETE FROM settings WHERE key = 'contact_whatsapp'",
    "UPDATE testimonials SET status = 'draft'",
    "UPDATE services SET price = NULL",
    "UPDATE services SET price = 'Mulai Rp5jt' WHERE slug = 'website-development'",
    "UPDATE services SET price = 'Custom' WHERE slug = 'sistem-informasi'",
  ]);
  hapusCacheSettings();
  console.log("Data contoh dibersihkan; D1 lokal kembali ke keadaan semula.");
} else {
  jalankanSql([
    `INSERT INTO settings (id, key, value, "group") VALUES ('seeddummywa0000000000000001', 'contact_whatsapp', ${kutip(WHATSAPP_CONTOH)}, 'site') ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    "UPDATE testimonials SET status = 'published'",
    ...HARGA_CONTOH.map(
      ([slug, harga]) => `UPDATE services SET price = ${kutip(harga)} WHERE slug = ${kutip(slug)}`,
    ),
  ]);
  hapusCacheSettings();

  console.log("D1 lokal terisi data contoh:");
  console.log(`  WhatsApp   ${WHATSAPP_CONTOH}  (FIKTIF)`);
  console.log("  Testimoni  3 baris diterbitkan");
  console.log(`  Harga      ${HARGA_CONTOH.length} layanan terisi  (FIKTIF)`);
  console.log("\nJalankan dengan --bersih untuk mengembalikannya.");
}
