import { getCloudflareContext } from "@opennextjs/cloudflare";

interface LeadNotification {
  subject: string;
  text: string;
}

/**
 * Kirim notifikasi email lead (via Resend). Best-effort & config-gated:
 * jika RESEND_API_KEY / LEAD_NOTIFY_EMAIL belum di-set → tidak melakukan apa-apa.
 * Kegagalan tidak menggagalkan submission.
 */
export async function notifyNewLead(payload: LeadNotification): Promise<void> {
  try {
    const { env } = getCloudflareContext();
    const e = env as unknown as {
      RESEND_API_KEY?: string;
      LEAD_NOTIFY_EMAIL?: string;
      LEAD_FROM_EMAIL?: string;
    };
    if (!e.RESEND_API_KEY || !e.LEAD_NOTIFY_EMAIL) return;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${e.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: e.LEAD_FROM_EMAIL ?? "WalDev <onboarding@resend.dev>",
        to: e.LEAD_NOTIFY_EMAIL,
        subject: payload.subject,
        text: payload.text,
      }),
    });
  } catch {
    // best-effort
  }
}
