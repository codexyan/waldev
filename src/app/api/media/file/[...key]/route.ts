import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Serve objek R2 (media publik). Key = path setelah /api/media/file/. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
): Promise<Response> {
  const { key } = await params;
  const objectKey = key.map((k) => decodeURIComponent(k)).join("/");

  const { env } = getCloudflareContext();
  const object = await env.MEDIA_BUCKET.get(objectKey);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  headers.set("content-type", object.httpMetadata?.contentType ?? "application/octet-stream");
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
