/** Konfigurasi brand & situs (nilai default; sebagian dapat ditimpa lewat Site Settings/CMS). */
export const SITE = {
  name: "WalDev",
  tagline: "Build Digital Products",
  description:
    "WalDev, software house yang membangun aplikasi web dan sistem informasi. Lihat portofolio proyek kami beserta tautan ke situs yang masih tayang.",
  // Nilai sebenarnya di-set lewat NEXT_PUBLIC_SITE_URL pada wrangler.jsonc.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://waldev.mdcodeid.workers.dev",
} as const;

/**
 * Judul hero beranda selama Pengaturan › Hero beranda › Judul hero masih kosong.
 * Nada software house mengikuti acuan Vodjo dan GoSocial: sudut pandang "kami" dan "Anda",
 * dan pengunjung datang untuk melihat portofolio, bukan mencoba aplikasinya.
 */
export const HOME_INTRO = "Software house untuk solusi digital Anda.";

/** Kalimat pengantar di hero beranda, di bawah judul. */
export const HOME_LEAD =
  "WalDev membangun aplikasi web dan sistem informasi. Setiap proyek di portofolio punya halaman sendiri, dan yang masih tayang bisa langsung dikunjungi.";

/**
 * Basis rute admin (rahasia, tidak tertaut di publik).
 * Catatan: bila nilai ini diubah, penjaga sesi pada layout dashboard tetap
 * berlaku, namun tautan internal admin ikut menyesuaikan.
 */
export const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_BASE ?? "/panel";
