import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * Membuat instance Drizzle terikat ke binding D1 request saat ini.
 * Di Cloudflare Workers, binding tersedia per-request via getCloudflareContext(),
 * sehingga koneksi dibuat lazily (bukan sebagai singleton modul).
 */
export function getDb() {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema });
}

export type DB = ReturnType<typeof getDb>;
export { schema };
