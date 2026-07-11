"use server";

import { unstable_rethrow } from "next/navigation";
import { FORBIDDEN, invalid, type ActionResult } from "@/lib/action";
import { logActivity } from "@/server/activity-log";
import { getAuth } from "@/server/auth/config";
import { requirePermission } from "@/server/rbac/guard";
import * as dal from "./user.dal";
import { createUserSchema } from "./user.schema";

export async function createUserAction(input: unknown): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("user.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  if (await dal.getUserByEmail(parsed.data.email)) {
    return { ok: false, error: "Email sudah terdaftar." };
  }

  // autoSignIn:false pada config → tidak mengubah sesi admin saat ini.
  try {
    await getAuth().api.signUpEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.name,
      },
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Gagal membuat user." };
  }

  const created = await dal.getUserByEmail(parsed.data.email);
  if (created) await dal.setUserRole(created.id, parsed.data.roleId);
  await logActivity({ userId: actor.id, action: "user.create", entityType: "user", entityId: created?.id });
  return { ok: true, data: undefined };
}

export async function updateUserRoleAction(id: string, roleId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("user.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  if (!roleId) return { ok: false, error: "Peran tidak valid." };
  await dal.setUserRole(id, roleId);
  await logActivity({ userId: actor.id, action: "user.update-role", entityType: "user", entityId: id });
  return { ok: true, data: undefined };
}

export async function setUserActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("user.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  if (id === actor.id && !isActive) {
    return { ok: false, error: "Tidak dapat menonaktifkan akun Anda sendiri." };
  }
  await dal.setUserActive(id, isActive);
  await logActivity({
    userId: actor.id,
    action: isActive ? "user.activate" : "user.deactivate",
    entityType: "user",
    entityId: id,
  });
  return { ok: true, data: undefined };
}
