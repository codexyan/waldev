"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import type { ZodError } from "zod";
import { logActivity } from "@/server/activity-log";
import { requirePermission } from "@/server/rbac/guard";
import { upsertSeoMeta } from "@/modules/seo/seo.dal";
import * as dal from "./article.dal";
import { articleInputSchema, type ArticleInput } from "./article.schema";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

const FORBIDDEN = { ok: false as const, error: "Anda tidak memiliki izin untuk aksi ini." };

function invalid(error: ZodError): ActionResult<never> {
  return { ok: false, error: "Periksa kembali isian formulir.", fieldErrors: error.flatten().fieldErrors };
}

function toWriteData(input: ArticleInput): dal.ArticleWriteData {
  return {
    title: input.title,
    slug: input.slug,
    summary: input.summary ?? null,
    coverMediaId: input.coverMediaId || null,
    contentJson: input.contentJson,
    categoryId: input.categoryId || null,
    tags: input.tags ?? [],
    status: input.status,
    scheduledAt: input.scheduledAt ?? null,
  };
}

function revalidateArticle(slug?: string) {
  revalidatePath("/articles");
  if (slug) revalidatePath(`/articles/${slug}`);
}

export async function createArticle(
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  let actor;
  try {
    actor = await requirePermission("article.create");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }

  const parsed = articleInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const created = await dal.createArticle(toWriteData(parsed.data), actor.id);
  if (!created) return { ok: false, error: "Gagal membuat artikel." };

  await upsertSeoMeta("article", created.id, {
    metaTitle: parsed.data.metaTitle,
    metaDescription: parsed.data.metaDescription,
    noIndex: parsed.data.noIndex,
  });
  await logActivity({
    userId: actor.id,
    action: "article.create",
    entityType: "article",
    entityId: created.id,
    metadata: { title: parsed.data.title, status: parsed.data.status },
  });
  revalidateArticle(created.slug);
  return { ok: true, data: created };
}

export async function updateArticle(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  let actor;
  try {
    actor = await requirePermission("article.update");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }

  const parsed = articleInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const updated = await dal.updateArticle(id, toWriteData(parsed.data));
  await upsertSeoMeta("article", id, {
    metaTitle: parsed.data.metaTitle,
    metaDescription: parsed.data.metaDescription,
    noIndex: parsed.data.noIndex,
  });
  await logActivity({
    userId: actor.id,
    action: "article.update",
    entityType: "article",
    entityId: id,
  });
  revalidateArticle(updated.slug);
  return { ok: true, data: updated };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("article.delete");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }

  await dal.deleteArticle(id);
  await logActivity({ userId: actor.id, action: "article.delete", entityType: "article", entityId: id });
  revalidateArticle();
  return { ok: true, data: undefined };
}

export async function publishArticle(id: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("article.publish");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }

  await dal.setArticleStatus(id, "published");
  await logActivity({ userId: actor.id, action: "article.publish", entityType: "article", entityId: id });
  revalidateArticle();
  return { ok: true, data: undefined };
}
