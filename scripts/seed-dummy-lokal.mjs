/**
 * Mengisi D1 LOKAL dengan contoh arsip aplikasi supaya beranda, halaman aplikasi,
 * dan panel "Perlu kabar" tampil berisi saat dikembangkan.
 *
 *   node scripts/seed-dummy-lokal.mjs           # isi contoh
 *   node scripts/seed-dummy-lokal.mjs --bersih  # hapus contoh
 *
 * ============================ PERINGATAN ============================
 * SELURUH isi di bawah ini FIKTIF dan hanya untuk pengembangan lokal.
 *
 * Skrip ini SELALU memakai flag `--local`, jadi secara teknis tidak bisa
 * menyentuh database produksi. Semua baris memakai id berawalan `contoh_`,
 * sehingga --bersih hanya menghapus data contoh dan tidak menyentuh aplikasi
 * yang Anda isi sendiri lewat panel.
 * ====================================================================
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const bersih = process.argv.includes("--bersih");

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

const kutip = (nilai) => (nilai === null ? "NULL" : `'${String(nilai).replace(/'/g, "''")}'`);

/** Detik epoch untuk `n` hari lalu, dihitung oleh SQLite. `null` tetap NULL. */
const hariLalu = (n) => (n === null ? "NULL" : `strftime('%s', 'now', '-${n} days')`);

/** Dokumen Tiptap satu paragraf beserta HTML-nya, supaya panel dan situs membaca isi yang sama. */
function paragraf(teks) {
  return {
    json: JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: teks }] }],
    }),
    html: `<p>${teks.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`,
  };
}

/** Tiga keadaan yang perlu dilihat saat mengembangkan: dibangun (lama tanpa kabar), rilis, pensiun. */
const APLIKASI = [
  {
    id: "contoh_app_kas",
    nama: "Catatan Kas",
    slug: "contoh-catatan-kas",
    kalimat: "Pencatat kas harian untuk warung kecil yang tetap bisa dipakai tanpa internet.",
    status: "building",
    mulai: 90,
    rilis: null,
    pensiun: null,
    catatanRilis: 0,
    penjelasan: "Contoh penjelasan aplikasi yang masih dibangun.",
    fitur: [
      ["Catat pemasukan dan pengeluaran", "Satu layar, dua tombol."],
      ["Rekap harian", null],
    ],
    // Catatan terakhir 40 hari lalu, supaya muncul di panel "Perlu kabar".
    catatan: [[40, "Mulai menyusun layar pencatatan.", null]],
  },
  {
    id: "contoh_app_piket",
    nama: "Jadwal Piket",
    slug: "contoh-jadwal-piket",
    kalimat: "Pembagi jadwal piket kelas yang adil dan bisa dibagikan lewat tautan.",
    status: "released",
    mulai: 200,
    rilis: 120,
    pensiun: null,
    catatanRilis: 1,
    penjelasan: "Contoh penjelasan aplikasi yang sudah rilis.",
    fitur: [["Acak jadwal otomatis", "Tidak ada yang kebagian dua kali berturut-turut."]],
    catatan: [
      [180, "Prototipe pertama selesai.", null],
      [120, "Rilis pertama untuk satu kelas.", "v1.0"],
      [14, "Menambah ekspor jadwal ke PDF.", "v1.1"],
    ],
  },
  {
    id: "contoh_app_tamu",
    nama: "Buku Tamu Digital",
    slug: "contoh-buku-tamu",
    kalimat: "Buku tamu acara berbasis kode QR yang sempat dipakai beberapa pernikahan.",
    status: "retired",
    mulai: 700,
    rilis: 650,
    pensiun: 300,
    catatanRilis: 0,
    penjelasan: "Contoh penjelasan aplikasi yang sudah pensiun.",
    fitur: [["Pindai kode QR di pintu masuk", null]],
    catatan: [[320, "Catatan terakhir sebelum layanan dihentikan.", null]],
  },
];

// Fitur dan catatan ikut terhapus lewat cascade.
const HAPUS_CONTOH = "DELETE FROM apps WHERE id LIKE 'contoh_app_%'";

if (bersih) {
  jalankanSql([HAPUS_CONTOH]);
  console.log("Contoh arsip aplikasi dihapus dari D1 lokal.");
} else {
  const pernyataan = [HAPUS_CONTOH];

  for (const app of APLIKASI) {
    const isi = paragraf(app.penjelasan);
    pernyataan.push(
      `INSERT INTO apps (id, name, slug, tagline, description_json, description_html, status, is_published,
        started_at, released_at, retired_at, show_guide, show_faq, show_notes, show_releases, created_at, updated_at)
      VALUES (${kutip(app.id)}, ${kutip(app.nama)}, ${kutip(app.slug)}, ${kutip(app.kalimat)},
        ${kutip(isi.json)}, ${kutip(isi.html)}, ${kutip(app.status)}, 1,
        ${hariLalu(app.mulai)}, ${hariLalu(app.rilis)}, ${hariLalu(app.pensiun)}, 0, 0, 1, ${app.catatanRilis},
        ${hariLalu(app.mulai)}, strftime('%s', 'now'))`,
    );

    app.fitur.forEach(([judul, keterangan], i) => {
      pernyataan.push(
        `INSERT INTO app_features (id, app_id, title, description, "order")
        VALUES (${kutip(`${app.id}_f${i}`)}, ${kutip(app.id)}, ${kutip(judul)}, ${kutip(keterangan)}, ${i})`,
      );
    });

    app.catatan.forEach(([hari, isiCatatan, versi], i) => {
      pernyataan.push(
        `INSERT INTO app_notes (id, app_id, body, version, noted_at, created_at, updated_at)
        VALUES (${kutip(`${app.id}_n${i}`)}, ${kutip(app.id)}, ${kutip(isiCatatan)}, ${kutip(versi)},
          ${hariLalu(hari)}, ${hariLalu(hari)}, ${hariLalu(hari)})`,
      );
    });
  }

  jalankanSql(pernyataan);

  console.log("D1 lokal terisi contoh arsip aplikasi (FIKTIF):");
  for (const app of APLIKASI) console.log(`  ${app.status.padEnd(9)} /apps/${app.slug}`);
  console.log("\nJalankan dengan --bersih untuk menghapusnya.");
}
