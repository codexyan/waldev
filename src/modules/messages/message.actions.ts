"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { FORBIDDEN, type ActionResult } from "@/lib/action";
import { ADMIN_BASE } from "@/lib/constants";
import { requirePermission } from "@/server/rbac/guard";
import { MESSAGE_STATUSES, setMessageStatus, type MessageStatus } from "./message.dal";

function isMessageStatus(value: unknown): value is MessageStatus {
  return typeof value === "string" && (MESSAGE_STATUSES as readonly string[]).includes(value);
}

/** Tandai pesan kontak dibaca, arsipkan, atau kembalikan dari arsip. */
export async function updateMessageStatusAction(
  id: string,
  status: unknown,
): Promise<ActionResult> {
  try {
    await requirePermission("message.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  if (!isMessageStatus(status)) return { ok: false, error: "Status pesan tidak dikenal." };
  await setMessageStatus(id, status);
  revalidatePath(`${ADMIN_BASE}/messages`);
  return { ok: true, data: undefined };
}
