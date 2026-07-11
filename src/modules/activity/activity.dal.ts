import { desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { activityLogs, user } from "@/server/db/schema";

export async function listActivityLogs(limit = 100) {
  const db = getDb();
  return db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      entityType: activityLogs.entityType,
      entityId: activityLogs.entityId,
      createdAt: activityLogs.createdAt,
      userName: user.name,
    })
    .from(activityLogs)
    .leftJoin(user, eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}
