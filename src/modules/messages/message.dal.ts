import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { contactMessages } from "@/server/db/schema";

export const MESSAGE_STATUSES = ["new", "read", "archived"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

/** Semua pesan dari formulir kontak, terbaru di atas. Panel memisahkan yang diarsipkan. */
export async function listMessages() {
  const db = getDb();
  return db
    .select({
      id: contactMessages.id,
      name: contactMessages.name,
      email: contactMessages.email,
      message: contactMessages.message,
      status: contactMessages.status,
      createdAt: contactMessages.createdAt,
    })
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));
}

/** Jumlah pesan yang belum dibaca, untuk lencana menu Pesan. */
export async function countNewMessages(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ total: count() })
    .from(contactMessages)
    .where(eq(contactMessages.status, "new"));
  return rows[0]?.total ?? 0;
}

export async function setMessageStatus(id: string, status: MessageStatus) {
  const db = getDb();
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
}
