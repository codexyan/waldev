import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createId } from "@paralleldrive/cuid2";
import { slugify } from "@/lib/slug";
import { createMedia, type MediaKind } from "@/modules/media/media.dal";

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

export function detectMediaKind(mime: string): MediaKind | null {
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

/** Simpan File ke R2 + catat metadata di tabel media. Return record atau null bila tipe tak didukung. */
export async function storeUploadedFile(file: File, uploadedBy: string | null) {
  const kind = detectMediaKind(file.type);
  if (!kind) return null;

  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  const base = dot >= 0 ? file.name.slice(0, dot) : file.name;
  const key = `${kind}/${createId()}-${slugify(base)}${ext}`;

  const { env } = getCloudflareContext();
  await env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return createMedia({
    r2Key: key,
    url: `/api/media/file/${key}`,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    kind,
    uploadedBy,
  });
}
