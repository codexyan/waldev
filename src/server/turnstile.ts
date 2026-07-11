import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Verifikasi token Cloudflare Turnstile.
 * Jika TURNSTILE_SECRET_KEY belum di-set → lewati (return true) agar form tetap
 * berfungsi sebelum Turnstile dikonfigurasi.
 */
export async function verifyTurnstile(token?: string | null, ip?: string): Promise<boolean> {
  const { env } = getCloudflareContext();
  const secret = (env as unknown as { TURNSTILE_SECRET_KEY?: string }).TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
