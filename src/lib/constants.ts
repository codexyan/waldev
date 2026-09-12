/** Konfigurasi brand & situs (nilai default; sebagian dapat ditimpa lewat Site Settings/CMS). */
export const SITE = {
  name: "WalDev",
  tagline: "Build Digital Products",
  description:
    "WalDev adalah arsip aplikasi yang saya bangun dan rawat, dari yang masih dibangun sampai yang sudah pensiun, lengkap dengan catatan pembuatannya.",
  // Nilai sebenarnya di-set lewat NEXT_PUBLIC_SITE_URL pada wrangler.jsonc.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://waldev.mdcodeid.workers.dev",
} as const;

/**
 * Kalimat pembuka beranda selama Pengaturan › Kalimat pengantar beranda masih
 * kosong. Orang pertama, sama seperti seluruh situs publik.
 */
export const HOME_INTRO = "Arsip aplikasi yang saya bangun dan rawat.";

/**
 * Basis rute admin (rahasia, tidak tertaut di publik).
 * Catatan: bila nilai ini diubah, penjaga sesi pada layout dashboard tetap
 * berlaku, namun tautan internal admin ikut menyesuaikan.
 */
export const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_BASE ?? "/panel";
