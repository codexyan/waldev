/**
 * Mengganti kata sandi akun panel di D1 LOKAL, untuk saat lupa kata sandi pengembangan.
 *
 *   node scripts/reset-password-lokal.mjs
 *
 * Kata sandi diketik langsung di terminal (tidak ditampilkan), dan tidak pernah
 * masuk ke riwayat shell atau argumen perintah. Berkas SQL sementara yang memuat
 * hash-nya dihapus segera setelah dipakai. Skrip ini SELALU memakai `--local`,
 * jadi akun produksi tidak tersentuh.
 *
 * Better Auth meng-hash kata sandi dengan scrypt tanpa BETTER_AUTH_SECRET, jadi
 * hash yang dibuat di sini langsung cocok untuk login lokal.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { hashPassword, verifyPassword } from "better-auth/crypto";

const kutip = (nilai) => `'${String(nilai).replace(/'/g, "''")}'`;

/**
 * Jalankan SQL di D1 lokal lewat berkas sementara (di Windows, --command dengan
 * tanda kutip terpecah sebelum sampai ke wrangler). Mengembalikan hasil pernyataan terakhir.
 */
function sql(pernyataan) {
  const folder = mkdtempSync(join(tmpdir(), "waldev-sandi-"));
  const berkas = join(folder, "perintah.sql");
  try {
    writeFileSync(berkas, pernyataan, "utf8");
    const hasil = spawnSync(
      "npx",
      ["wrangler", "d1", "execute", "waldev-db", "--local", "--json", "--file", berkas],
      { encoding: "utf8", shell: process.platform === "win32" },
    );
    if (hasil.status !== 0) {
      throw new Error(hasil.stderr || hasil.stdout || "wrangler gagal dijalankan");
    }
    const keluaran = JSON.parse(hasil.stdout.slice(hasil.stdout.indexOf("[")));
    return keluaran.at(-1) ?? { results: [], meta: {} };
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}

/** Tanya satu baris di terminal. Dengan `tersembunyi`, ketikan tidak ditampilkan. */
function tanya(label, { tersembunyi = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let bisu = false;
    let terjawab = false;
    rl._writeToOutput = (teks) => {
      if (!bisu) process.stdout.write(teks);
    };
    rl.on("close", () => {
      if (!terjawab) berhenti(`\n${TERMINAL_INTERAKTIF}`);
    });
    rl.question(label, (jawaban) => {
      terjawab = true;
      rl.close();
      if (tersembunyi) process.stdout.write("\n");
      resolve(jawaban);
    });
    // Label sudah tertulis; mulai sekarang ketikan tidak ikut ditampilkan.
    bisu = tersembunyi;
  });
}

function berhenti(pesan) {
  console.error(pesan);
  process.exit(1);
}

const TERMINAL_INTERAKTIF =
  "Skrip ini perlu terminal yang bisa diketik. Ketik perintahnya langsung di PowerShell " +
  "(node scripts/reset-password-lokal.mjs), jangan lewat tombol Run, lalu jawab setiap pertanyaan.";

// Tanpa terminal interaktif, pertanyaan tidak pernah terjawab dan skrip berhenti tanpa pesan.
if (!process.stdin.isTTY) berhenti(TERMINAL_INTERAKTIF);

const pengguna = sql(
  `SELECT u.email, u.is_active AS aktif, r.name AS peran,
     EXISTS (SELECT 1 FROM account a WHERE a.user_id = u.id AND a.provider_id = 'credential') AS punya_sandi
   FROM user u LEFT JOIN roles r ON r.id = u.role_id
   ORDER BY u.created_at;`,
).results;

if (pengguna.length === 0) {
  berhenti("Belum ada akun di D1 lokal. Buat dulu lewat POST /api/seed (lihat src/app/api/seed/route.ts).");
}

console.log("Akun di D1 lokal:");
for (const p of pengguna) {
  const keterangan = [p.peran ?? "tanpa peran", p.aktif ? null : "nonaktif", p.punya_sandi ? null : "tanpa kata sandi"]
    .filter(Boolean)
    .join(", ");
  console.log(`  ${p.email}  (${keterangan})`);
}

const bawaan = pengguna[0].email;
const email = (await tanya(`\nEmail [${bawaan}]: `)).trim() || bawaan;
const target = pengguna.find((p) => p.email === email);
if (!target) berhenti(`Akun ${email} tidak ada di D1 lokal.`);
if (!target.punya_sandi) berhenti(`Akun ${email} tidak memakai login email + kata sandi.`);

const sandi = await tanya("Kata sandi baru (minimal 8 karakter): ", { tersembunyi: true });
if (sandi.length < 8) berhenti("Kata sandi minimal 8 karakter. Tidak ada yang diubah.");
const ulang = await tanya("Ulangi kata sandi baru: ", { tersembunyi: true });
if (sandi !== ulang) berhenti("Kedua kata sandi tidak sama. Tidak ada yang diubah.");

const hash = await hashPassword(sandi);
if (!(await verifyPassword({ hash, password: sandi }))) {
  berhenti("Hash tidak lolos verifikasi. Tidak ada yang diubah.");
}

const hasil = sql(
  `UPDATE account SET password = ${kutip(hash)}, updated_at = strftime('%s', 'now')
   WHERE provider_id = 'credential' AND user_id = (SELECT id FROM user WHERE email = ${kutip(email)});`,
);
if (!hasil.meta?.changes) berhenti("Tidak ada akun yang diperbarui.");

console.log(`\nKata sandi ${email} di D1 lokal sudah diganti. Silakan login di /panel/login.`);
if (!target.aktif || !target.peran) {
  console.log("Catatan: akun ini nonaktif atau tanpa peran, jadi panel tetap menolak masuk.");
}
