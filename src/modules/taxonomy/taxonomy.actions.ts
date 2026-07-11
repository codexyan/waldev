"use server";

import { unstable_rethrow } from "next/navigation";
import { FORBIDDEN, invalid, type ActionResult } from "@/lib/action";
import { logActivity } from "@/server/activity-log";
import { requirePermission } from "@/server/rbac/guard";
import * as dal from "./taxonomy.dal";
import { categoryInputSchema, tagInputSchema } from "./taxonomy.schema";

export async function createCategoryAction(input: unknown): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("taxonomy.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  await dal.createCategory(parsed.data);
  await logActivity({ userId: actor.id, action: "category.create", entityType: "category" });
  return { ok: true, data: undefined };
}

export async function updateCategoryAction(id: string, input: unknown): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("taxonomy.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  await dal.updateCategory(id, parsed.data);
  await logActivity({ userId: actor.id, action: "category.update", entityType: "category", entityId: id });
  return { ok: true, data: undefined };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("taxonomy.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  await dal.deleteCategory(id);
  await logActivity({ userId: actor.id, action: "category.delete", entityType: "category", entityId: id });
  return { ok: true, data: undefined };
}

export async function createTagAction(input: unknown): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("taxonomy.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  const parsed = tagInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  await dal.createTag(parsed.data);
  await logActivity({ userId: actor.id, action: "tag.create", entityType: "tag" });
  return { ok: true, data: undefined };
}

export async function deleteTagAction(id: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("taxonomy.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  await dal.deleteTag(id);
  await logActivity({ userId: actor.id, action: "tag.delete", entityType: "tag", entityId: id });
  return { ok: true, data: undefined };
}
