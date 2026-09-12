/** Konfigurasi brand & situs (nilai default; sebagian dapat ditimpa lewat Site Settings/CMS). */
export const SITE = {
  name: "WalDev",
  tagline: "Build Digital Products",
  description:
    "Portofolio aplikasi web WalDev, lengkap dengan fitur dan catatan pembuatan tiap aplikasi.",
  // Nilai sebenarnya di-set lewat NEXT_PUBLIC_SITE_URL pada wrangler.jsonc.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://waldev.mdcodeid.workers.dev",
} as const;

/**
 * Judul beranda selama Pengaturan › Kalimat pengantar beranda masih kosong.
 * Teks publik tidak memakai "saya"; pelakunya disebut langsung.
 */
export const HOME_INTRO = "Aplikasi web buatan WalDev.";

/** Kalimat pengantar di hero beranda, di bawah judul. */
export const HOME_LEAD =
  "Setiap aplikasi punya halaman sendiri berisi penjelasan, fitur, dan catatan pembuatannya.";

/**
 * Basis rute admin (rahasia, tidak tertaut di publik).
 * Catatan: bila nilai ini diubah, penjaga sesi pada layout dashboard tetap
 * berlaku, namun tautan internal admin ikut menyesuaikan.
 */
export const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_BASE ?? "/panel";
