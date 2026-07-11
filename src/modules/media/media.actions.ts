"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_rethrow } from "next/navigation";
import { FORBIDDEN, type ActionResult } from "@/lib/action";
import { logActivity } from "@/server/activity-log";
import { requirePermission } from "@/server/rbac/guard";
import * as dal from "./media.dal";

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("media.delete");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }

  const r2Key = await dal.deleteMedia(id);
  if (r2Key) {
    try {
      const { env } = getCloudflareContext();
      await env.MEDIA_BUCKET.delete(r2Key);
    } catch {
      // objek mungkin sudah tidak ada; abaikan
    }
  }
  await logActivity({ userId: actor.id, action: "media.delete", entityType: "media", entityId: id });
  return { ok: true, data: undefined };
}
