import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/server/db/client";
import { settings } from "@/server/db/schema";
import { SITE_SETTINGS_DEFAULTS, type SettingsKey, type SiteSettings } from "./settings";

const CACHE_KEY = "cache:site-settings";
const CACHE_TTL = 300; // detik

export async function getSiteSettings(): Promise<SiteSettings> {
  const { env } = getCloudflareContext();

  try {
    const cached = await env.CACHE_KV.get(CACHE_KEY);
    if (cached) return JSON.parse(cached) as SiteSettings;
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
}

async function invalidateCache() {
  try {
    const { env } = getCloudflareContext();
    await env.CACHE_KV.delete(CACHE_KEY);
  } catch {
    // abaikan
  }
}

export async function saveSiteSettings(values: Partial<Record<SettingsKey, string>>) {
  const db = getDb();
  for (const [key, value] of Object.entries(values)) {
    await db
      .insert(settings)
      .values({ key, value, group: "site" })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
  await invalidateCache();
}
