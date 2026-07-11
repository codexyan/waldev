import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Optimasi gambar akan memakai Cloudflare Images (custom loader)
    // dikonfigurasi pada fase Media/SEO. Sementara biarkan default.
  },
};

export default nextConfig;

// Mengaktifkan akses Cloudflare bindings (getCloudflareContext) saat `next dev`.
initOpenNextCloudflareForDev();
