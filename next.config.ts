import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

/* Mode hemat memori, hanya dinyalakan `pnpm terbitkan` setelah skrip itu menjalankan
   `tsc --noEmit` sendiri. Pengecekan tipe kedua di dalam `next build` dilewati dan worker
   dikurangi menjadi satu (bawaannya jumlah core dikurangi satu). Keluaran build tetap sama.
   Pada 13 September build dihentikan di tahap pengecekan tipe karena RAM laptop menipis. */
const buildHemat = process.env.WALDEV_BUILD_HEMAT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(buildHemat
    ? {
        typescript: { ignoreBuildErrors: true },
        experimental: { webpackMemoryOptimizations: true, cpus: 1 },
      }
    : {}),
  images: {
    // Optimasi gambar memakai Cloudflare Images/loader kustom bila diperlukan.
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  /* Halaman situs jasa lama (docs/09 §4.1), dialihkan permanen supaya tautan yang
     sudah beredar tidak berakhir di 404. Karya lama yang dipindah ke arsip
     memakai slug yang sama. */
  async redirects() {
    const keBeranda = [
      "/portfolio",
      "/services",
      "/services/:slug",
      "/clients",
      "/testimonials",
      "/terms-of-service",
    ];
    return [
      { source: "/portfolio/:slug", destination: "/apps/:slug", permanent: true },
      { source: "/contact", destination: "/about", permanent: true },
      { source: "/collaboration", destination: "/about", permanent: true },
      ...keBeranda.map((source) => ({ source, destination: "/", permanent: true })),
    ];
  },
};

export default nextConfig;

// Mengaktifkan akses Cloudflare bindings (getCloudflareContext) saat `next dev`.
initOpenNextCloudflareForDev();
