import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Konfigurasi OpenNext untuk Cloudflare Workers.
// Incremental cache (ISR) berbasis R2/KV akan ditambahkan pada fase SEO/ISR.
export default defineCloudflareConfig({});
