"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { FORBIDDEN, invalid, type ActionResult } from "@/lib/action";
import { logActivity } from "@/server/activity-log";
import { requirePermission } from "@/server/rbac/guard";
import * as dal from "./client.dal";
import { clientInputSchema, type ClientInput } from "./client.schema";

function toWriteData(input: ClientInput): dal.ClientWriteData {
  return {
    name: input.name,
    slug: input.slug,
    logoMediaId: input.logoMediaId,
    websiteUrl: input.websiteUrl,
    isNda: input.isNda,
    order: input.order,
  };
}

export async function createClientAction(input: unknown): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("client.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  const parsed = clientInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  await dal.createClient(toWriteData(parsed.data));
  await logActivity({ userId: actor.id, action: "client.create", entityType: "client" });
  // Logo klien tampil di beranda.
  revalidatePath("/");
  return { ok: true, data: undefined };
}

export async function updateClientAction(id: string, input: unknown): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("client.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  const parsed = clientInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  await dal.updateClient(id, toWriteData(parsed.data));
  await logActivity({ userId: actor.id, action: "client.update", entityType: "client", entityId: id });
  revalidatePath("/");
  return { ok: true, data: undefined };
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("client.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  await dal.deleteClient(id);
  await logActivity({ userId: actor.id, action: "client.delete", entityType: "client", entityId: id });
  revalidatePath("/");
  return { ok: true, data: undefined };
}
