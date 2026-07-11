import { getDb } from "@/server/db/client";
import { settings } from "@/server/db/schema";
import { SITE_SETTINGS_DEFAULTS, type SettingsKey, type SiteSettings } from "./settings";

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getDb();
  const rows = await db.select({ key: settings.key, value: settings.value }).from(settings);
  const map: Record<string, string> = { ...SITE_SETTINGS_DEFAULTS };
  for (const row of rows) {
    if (row.key in SITE_SETTINGS_DEFAULTS && row.value != null) {
      map[row.key] = row.value;
    }
  }
  return map as SiteSettings;
}

export async function saveSiteSettings(values: Partial<Record<SettingsKey, string>>) {
  const db = getDb();
  for (const [key, value] of Object.entries(values)) {
    await db
      .insert(settings)
      .values({ key, value, group: "site" })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
}
