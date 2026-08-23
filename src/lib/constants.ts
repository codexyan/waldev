/** Konfigurasi brand & situs (nilai default; sebagian dapat ditimpa lewat Site Settings/CMS). */
export const SITE = {
  name: "WalDev",
  tagline: "Studio Digital Indonesia",
  description:
    "WalDev merancang dan membangun website, sistem informasi, dan dashboard internal untuk bisnis di Indonesia, dikerjakan dari Banjarmasin. Dari perencanaan sampai peluncuran, oleh satu tim yang sama.",
  // Nilai sebenarnya di-set lewat NEXT_PUBLIC_SITE_URL pada wrangler.jsonc.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://waldev.mdcodeid.workers.dev",
} as const;

/**
 * Kalimat pembuka di beranda. Satu kalimat utuh, pemenggalan barisnya
 * diserahkan kepada browser — judul yang dipaksa patah di tempat tertentu
 * selalu salah di salah satu ukuran layar.
 *
 * Menyebut produknya sejak kata pertama: pengunjung tidak perlu menebak apa
 * yang sebenarnya dijual.
 */
export const HERO_TITLE = "Website dan sistem untuk bisnis Anda, dikerjakan sampai jadi.";

/**
 * Perkiraan waktu pengerjaan. Satu sumber kebenaran supaya angka di beranda
 * tidak pernah berbeda dari jawaban FAQ dan halaman layanan.
 */
export const DURASI = [
  { jenis: "Halaman promosi / company profile", waktu: "1–2 minggu" },
  { jenis: "Website perusahaan dengan CMS", waktu: "3–5 minggu" },
  { jenis: "Sistem informasi / dashboard", waktu: "6 minggu ke atas" },
] as const;

/** Janji waktu balas yang dipakai di seluruh situs. */
export const WAKTU_BALAS = "1x24 jam kerja";

/**
 * Basis rute admin (rahasia, tidak tertaut di publik).
 * Catatan: bila nilai ini diubah, penjaga sesi pada layout dashboard tetap
 * berlaku, namun tautan internal admin ikut menyesuaikan.
 */
export const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_BASE ?? "/panel";
