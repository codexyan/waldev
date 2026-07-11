import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { publishDueScheduled } from "@/modules/articles/article.dal";

/**
 * Publikasikan artikel berstatus `scheduled` yang waktunya sudah tiba.
 * Lindungi dengan header `x-cron-secret` (dibandingkan CRON_SECRET) agar dapat
 * dipicu oleh Cloudflare Cron Trigger / scheduler eksternal.
 */
async function run(request: Request): Promise<Response> {
  const { env } = getCloudflareContext();
  const secret = (env as unknown as { CRON_SECRET?: string }).CRON_SECRET;

  if (!secret || request.headers.get("x-cron-secret") !== secret) {
    return Response.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const published = await publishDueScheduled();
  if (published > 0) revalidatePath("/articles");

  return Response.json({ success: true, data: { published } });
}

export async function POST(request: Request): Promise<Response> {
  return run(request);
}

export async function GET(request: Request): Promise<Response> {
  return run(request);
}
