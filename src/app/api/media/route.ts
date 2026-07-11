import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createId } from "@paralleldrive/cuid2";
import { slugify } from "@/lib/slug";
import { createMedia, type MediaKind } from "@/modules/media/media.dal";
import { getSession } from "@/server/auth/session";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function detectKind(mime: string): MediaKind | null {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (
    mime === "text/plain" ||
    mime === "application/msword" ||
    mime.includes("officedocument") ||
    mime.includes("opendocument")
  ) {
    return "document";
  }
  return null;
}

export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Body tidak valid" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ ok: false, error: "File wajib diunggah" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ ok: false, error: "Ukuran file maksimal 10MB" }, { status: 400 });
  }
  const kind = detectKind(file.type);
  if (!kind) {
    return Response.json({ ok: false, error: "Tipe file tidak didukung" }, { status: 400 });
  }

  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  const base = dot >= 0 ? file.name.slice(0, dot) : file.name;
  const key = `${kind}/${createId()}-${slugify(base)}${ext}`;

  const { env } = getCloudflareContext();
  const buffer = await file.arrayBuffer();
  await env.MEDIA_BUCKET.put(key, buffer, { httpMetadata: { contentType: file.type } });

  const record = await createMedia({
    r2Key: key,
    url: `/api/media/file/${key}`,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    kind,
    uploadedBy: session.user.id,
  });

  return Response.json({ ok: true, data: record });
}
