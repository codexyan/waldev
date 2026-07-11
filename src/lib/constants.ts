/** Konfigurasi brand & situs (nilai default; sebagian akan pindah ke Site Settings/CMS di v1.0). */
export const SITE = {
  name: "WalDev",
  tagline: "Build Digital Products.",
  description:
    "WalDev adalah studio digital yang membangun website, sistem informasi, web application, dan produk digital yang modern, cepat, dan profesional.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

/**
 * Basis rute admin (rahasia, tidak tertaut di publik).
 * Catatan: `matcher` di src/middleware.ts memakai literal statik "/panel/:path*"
 * sehingga bila nilai ini diubah, matcher middleware juga harus diselaraskan.
 */
export const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_BASE ?? "/panel";
