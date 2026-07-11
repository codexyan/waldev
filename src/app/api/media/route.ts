import { listMedia } from "@/modules/media/media.dal";
import { getSession } from "@/server/auth/session";
import { MAX_UPLOAD_SIZE, storeUploadedFile } from "@/server/r2/upload";

export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  const items = await listMedia();
  return Response.json({ ok: true, data: items });
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
  if (file.size > MAX_UPLOAD_SIZE) {
    return Response.json({ ok: false, error: "Ukuran file maksimal 10MB" }, { status: 400 });
  }

  const record = await storeUploadedFile(file, session.user.id);
  if (!record) {
    return Response.json({ ok: false, error: "Tipe file tidak didukung" }, { status: 400 });
  }
  return Response.json({ ok: true, data: record });
}
