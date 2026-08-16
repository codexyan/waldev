/** Konfigurasi brand & situs (nilai default; sebagian dapat ditimpa lewat Site Settings/CMS). */
export const SITE = {
  name: "WalDev",
  tagline: "Studio Digital Indonesia",
  description:
    "WalDev merancang dan membangun website, sistem informasi, dan dashboard internal untuk bisnis di Indonesia. Dari riset sampai peluncuran, dikerjakan oleh satu tim.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://wolue.cloud",
} as const;

/** Kalimat pembuka di beranda, dipecah per baris agar bisa dianimasikan. */
export const HERO_LINES = ["Kebutuhan bisnis Anda,", "jadi produk digital", "yang bekerja."];

/** Kata pada baris terakhir yang diberi sapuan stabilo. */
export const HERO_MARKED_WORD = "bekerja.";

/** Kapabilitas yang ditampilkan pada pita berjalan di beranda. */
export const CAPABILITIES = [
  "Website Development",
  "Sistem Informasi",
  "Dashboard Internal",
  "Landing Page",
  "Integrasi AI",
  "Otomasi Proses",
  "UI/UX Design",
  "Perawatan & Dukungan",
];

/**
 * Basis rute admin (rahasia, tidak tertaut di publik).
 * Catatan: bila nilai ini diubah, penjaga sesi pada layout dashboard tetap
 * berlaku, namun tautan internal admin ikut menyesuaikan.
 */
export const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_BASE ?? "/panel";
