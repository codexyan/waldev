"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { FORBIDDEN, type ActionResult } from "@/lib/action";
import { logActivity } from "@/server/activity-log";
import { requirePermission } from "@/server/rbac/guard";
import { saveSiteSettings } from "./settings.dal";
import { SITE_SETTINGS_DEFAULTS, type SettingsKey } from "./settings";

export async function updateSettingsAction(input: unknown): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("settings.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }

  const source = (input ?? {}) as Record<string, unknown>;
  const values: Partial<Record<SettingsKey, string>> = {};
  for (const key of Object.keys(SITE_SETTINGS_DEFAULTS) as SettingsKey[]) {
    const value = source[key];
    if (typeof value === "string") values[key] = value.trim();
  }

  await saveSiteSettings(values);
  await logActivity({ userId: actor.id, action: "settings.update", entityType: "settings" });
  revalidatePath("/", "layout");
  return { ok: true, data: undefined };
}
