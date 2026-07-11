import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Rate limit sederhana berbasis KV (fixed window).
 * Return true jika masih diizinkan, false jika melebihi batas.
 * Tanpa KV → selalu izinkan.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  const { env } = getCloudflareContext();
  const kv = env.CACHE_KV;
  if (!kv) return true;

  const bucketKey = `rl:${key}`;
  const current = await kv.get(bucketKey);
  const count = current ? Number.parseInt(current, 10) : 0;
  if (count >= limit) return false;

  await kv.put(bucketKey, String(count + 1), { expirationTtl: windowSec });
  return true;
}
