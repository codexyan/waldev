import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { settings } from "@/server/db/schema";
import { SITE_SETTINGS_DEFAULTS, type SettingsKey, type SiteSettings } from "./settings";

/* Kunci ber-versi. Situs studio lama memakai `cache:site-settings` dengan nilai
   bawaan yang berbeda, dan selama masa pratinjau kedua versi berjalan di atas KV
   yang sama (docs/10 langkah 4). Dengan kunci yang sama, keduanya saling menimpa
   cache: situs lama bisa menampilkan tagline baru, dan versi ini bisa menerima
   objek tanpa kunci profil pembuat. */
const CACHE_KEY = "cache:site-settings:v2";
const CACHE_TTL = 300; // detik

/**
 * Dibungkus React `cache()` sehingga satu render hanya membaca sekali.
 * Sebelumnya layout, halaman, dan panel CTA memanggilnya masing-masing; saat
 * cache KV meleset, ketiganya menembak D1 bersamaan lalu saling menimpa.
 */
export const getSiteSettings = cache(async function getSiteSettings(): Promise<SiteSettings> {
  const { env } = getCloudflareContext();

  try {
    const cached = await env.CACHE_KV.get(CACHE_KEY);
    // Digabung dengan nilai bawaan supaya kunci yang baru ditambahkan tidak pernah undefined.
    if (cached) {
      return { ...SITE_SETTINGS_DEFAULTS, ...(JSON.parse(cached) as Partial<SiteSettings>) };
    }
  } catch {
    // lanjut ke DB bila KV gagal
  }

  const db = getDb();
  const rows = await db.select({ key: settings.key, value: settings.value }).from(settings);
  const map: Record<string, string> = { ...SITE_SETTINGS_DEFAULTS };
  for (const row of rows) {
    if (row.key in SITE_SETTINGS_DEFAULTS && row.value != null) {
      map[row.key] = row.value;
    }
  }
  const result = map as SiteSettings;

  try {
    await env.CACHE_KV.put(CACHE_KEY, JSON.stringify(result), { expirationTtl: CACHE_TTL });
  } catch {
    // abaikan kegagalan cache
  }
  return result;
});

async function invalidateCache() {
  try {
    const { env } = getCloudflareContext();
    await env.CACHE_KV.delete(CACHE_KEY);
  } catch {
    // abaikan
  }
}

/**
 * Nilai yang sama dengan bawaan kode tidak disimpan; barisnya dihapus. Tanpa ini,
 * sekali formulir Pengaturan disimpan, semua nilai bawaan saat itu (termasuk
 * tagline dan deskripsi) membeku di database, tidak lagi mengikuti kode, dan ikut
 * terbaca oleh versi situs lain yang memakai D1 yang sama.
 */
export async function saveSiteSettings(values: Partial<Record<SettingsKey, string>>) {
  const db = getDb();
  for (const [key, value] of Object.entries(values) as [SettingsKey, string][]) {
    if (value === SITE_SETTINGS_DEFAULTS[key]) {
      await db.delete(settings).where(eq(settings.key, key));
    } else {
      await db
        .insert(settings)
        .values({ key, value, group: "site" })
        .onConflictDoUpdate({ target: settings.key, set: { value } });
    }
  }
  await invalidateCache();
}
