import { getCloudflareContext } from "@opennextjs/cloudflare";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { navigationItems, navigationMenus } from "@/server/db/schema";

export interface NavItem {
  label: string;
  url: string;
}

const CACHE_TTL = 300;
const cacheKey = (key: string) => `cache:nav:${key}`;

export async function getMenuItems(key: string): Promise<NavItem[]> {
  const { env } = getCloudflareContext();

  try {
    const cached = await env.CACHE_KV.get(cacheKey(key));
    if (cached) return JSON.parse(cached) as NavItem[];
  } catch {
    // lanjut ke DB
  }

  const db = getDb();
  const menu = await db
    .select({ id: navigationMenus.id })
    .from(navigationMenus)
    .where(eq(navigationMenus.key, key))
    .limit(1);
  const m = menu[0];
  const items: NavItem[] = m
    ? await db
        .select({ label: navigationItems.label, url: navigationItems.url })
        .from(navigationItems)
        .where(eq(navigationItems.menuId, m.id))
        .orderBy(asc(navigationItems.order))
    : [];

  try {
    await env.CACHE_KV.put(cacheKey(key), JSON.stringify(items), { expirationTtl: CACHE_TTL });
  } catch {
    // abaikan
  }
  return items;
}

async function invalidateCache(key: string) {
  try {
    const { env } = getCloudflareContext();
    await env.CACHE_KV.delete(cacheKey(key));
  } catch {
    // abaikan
  }
}

export async function saveMenu(key: string, name: string, items: NavItem[]) {
  const db = getDb();
  const existing = await db
    .select({ id: navigationMenus.id })
    .from(navigationMenus)
    .where(eq(navigationMenus.key, key))
    .limit(1);

  let menuId = existing[0]?.id;
  if (!menuId) {
    const inserted = await db
      .insert(navigationMenus)
      .values({ key, name })
      .returning({ id: navigationMenus.id });
    menuId = inserted[0]?.id;
  }
  if (!menuId) return;
  const mid = menuId;

  await db.delete(navigationItems).where(eq(navigationItems.menuId, mid));
  const clean = items.filter((i) => i.label.trim() && i.url.trim());
  if (clean.length > 0) {
    await db.insert(navigationItems).values(
      clean.map((i, idx) => ({ menuId: mid, label: i.label.trim(), url: i.url.trim(), order: idx })),
    );
  }
  await invalidateCache(key);
}
