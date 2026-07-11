"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { FORBIDDEN, type ActionResult } from "@/lib/action";
import { logActivity } from "@/server/activity-log";
import { requirePermission } from "@/server/rbac/guard";
import { saveMenu, type NavItem } from "./navigation.dal";

export async function saveMenuAction(
  key: string,
  items: NavItem[],
): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("navigation.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  if (key !== "header" && key !== "footer") {
    return { ok: false, error: "Menu tidak valid." };
  }
  const clean = (Array.isArray(items) ? items : []).map((i) => ({
    label: String(i.label ?? ""),
    url: String(i.url ?? ""),
  }));
  await saveMenu(key, key === "header" ? "Header" : "Footer", clean);
  await logActivity({ userId: actor.id, action: "navigation.update", entityType: "navigation", entityId: key });
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}
