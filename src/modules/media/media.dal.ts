import { desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { media } from "@/server/db/schema";

export type MediaKind = "image" | "pdf" | "document";

export async function createMedia(data: {
  r2Key: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  kind: MediaKind;
  uploadedBy?: string | null;
}) {
  const db = getDb();
  const inserted = await db
    .insert(media)
    .values({
      r2Key: data.r2Key,
      url: data.url,
      filename: data.filename,
      mimeType: data.mimeType,
      size: data.size,
      kind: data.kind,
      uploadedBy: data.uploadedBy ?? null,
    })
    .returning();
  return inserted[0];
}

export async function listMedia() {
  const db = getDb();
  return db
    .select({
      id: media.id,
      url: media.url,
      filename: media.filename,
      mimeType: media.mimeType,
      size: media.size,
      kind: media.kind,
      createdAt: media.createdAt,
    })
    .from(media)
    .orderBy(desc(media.createdAt));
}

/** Hapus baris media dan kembalikan r2Key agar objek R2 ikut dihapus. */
export async function deleteMedia(id: string): Promise<string | null> {
  const db = getDb();
  const rows = await db.select({ r2Key: media.r2Key }).from(media).where(eq(media.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  await db.delete(media).where(eq(media.id, id));
  return row.r2Key;
}
