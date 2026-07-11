import { headers } from "next/headers";
import { checkRateLimit } from "@/server/rate-limit";
import { MAX_UPLOAD_SIZE, storeUploadedFile } from "@/server/r2/upload";

/** Upload lampiran form kolaborasi (publik). Rate-limited per IP. */
export async function POST(request: Request): Promise<Response> {
  const h = await headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for") ?? "unknown";
  if (!(await checkRateLimit(`attach:${ip}`, 10, 3600))) {
    return Response.json({ ok: false, error: "Terlalu banyak unggahan." }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "Body tidak valid" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ ok: false, error: "File wajib" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return Response.json({ ok: false, error: "Ukuran file maksimal 10MB" }, { status: 400 });
  }

  const record = await storeUploadedFile(file, null);
  if (!record) {
    return Response.json({ ok: false, error: "Tipe file tidak didukung" }, { status: 400 });
  }
  return Response.json({ ok: true, data: { id: record.id, url: record.url, filename: record.filename } });
}
