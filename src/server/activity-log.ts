import { getDb } from "@/server/db/client";
import { activityLogs } from "@/server/db/schema";

export interface ActivityEntry {
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: unknown;
}

/** Catat aksi admin ke activity_logs (best-effort; kegagalan log tak menggagalkan aksi). */
export async function logActivity(entry: ActivityEntry): Promise<void> {
  try {
    const db = getDb();
    await db.insert(activityLogs).values({
      userId: entry.userId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      metadata: entry.metadata === undefined ? null : JSON.stringify(entry.metadata),
    });
  } catch {
    // abaikan kegagalan logging
  }
}
