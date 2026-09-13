"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { FORBIDDEN, invalid, type ActionResult } from "@/lib/action";
import { logActivity } from "@/server/activity-log";
import { requirePermission } from "@/server/rbac/guard";
import type { Permission } from "@/server/rbac/permissions";
import { upsertSeoMeta } from "@/modules/seo/seo.dal";
import * as dal from "./app.dal";
import { appInputSchema, appNoteInputSchema, type AppInput } from "./app.schema";

const NOT_FOUND = { ok: false as const, error: "Aplikasi tidak ditemukan." };

/** Pengguna yang berizin, atau null bila ditolak. Galat internal Next tetap diteruskan. */
async function authorize(permission: Permission) {
  try {
    return await requirePermission(permission);
  } catch (e) {
    unstable_rethrow(e);
    return null;
  }
}

function toWriteData(input: AppInput): dal.AppWriteData {
  return {
    name: input.name,
    slug: input.slug,
    tagline: input.tagline,
    descriptionJson: input.descriptionJson,
    status: input.status,
    isPublished: input.isPublished,
    appUrl: input.appUrl,
    repoUrl: input.repoUrl,
    videoUrl: input.videoUrl,
    coverMediaId: input.coverMediaId,
    logoMediaId: input.logoMediaId,
    gallery: input.galleryMediaIds ?? [],
    startedAt: input.startedAt,
    releasedAt: input.releasedAt,
    retiredAt: input.retiredAt,
    technologies: input.technologies ?? [],
    features: input.features ?? [],
    guideJson: input.guideJson,
    faqs: input.faqs ?? [],
    showGuide: input.showGuide,
    showFaq: input.showFaq,
    showNotes: input.showNotes,
    showReleases: input.showReleases,
  };
}

function seoInput(input: AppInput) {
  return {
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    noIndex: input.noIndex,
  };
}

/** Beranda memuat daftar arsip, jadi setiap perubahan aplikasi ikut menyegarkannya. */
function revalidateApp(slug?: string | null) {
  revalidatePath("/");
  if (slug) revalidatePath(`/apps/${slug}`);
}

/* ------------------------------- Aplikasi -------------------------------- */

export async function createApp(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  const actor = await authorize("app.create");
  if (!actor) return FORBIDDEN;
  const parsed = appInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const created = await dal.createApp(toWriteData(parsed.data));
  if (!created) return { ok: false, error: "Gagal membuat aplikasi." };
  await upsertSeoMeta("app", created.id, seoInput(parsed.data));
  await logActivity({
    userId: actor.id,
    action: "app.create",
    entityType: "app",
    entityId: created.id,
    metadata: { name: parsed.data.name, status: parsed.data.status },
  });
  revalidateApp(created.slug);
  return { ok: true, data: created };
}

export async function updateApp(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const actor = await authorize("app.update");
  if (!actor) return FORBIDDEN;
  const parsed = appInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const updated = await dal.updateApp(id, toWriteData(parsed.data));
  if (!updated) return NOT_FOUND;
  await upsertSeoMeta("app", id, seoInput(parsed.data));
  await logActivity({ userId: actor.id, action: "app.update", entityType: "app", entityId: id });
  revalidateApp(updated.slug);
  return { ok: true, data: updated };
}

export async function deleteApp(id: string): Promise<ActionResult> {
  const actor = await authorize("app.delete");
  if (!actor) return FORBIDDEN;

  const deleted = await dal.deleteApp(id);
  if (!deleted) return NOT_FOUND;
  await logActivity({ userId: actor.id, action: "app.delete", entityType: "app", entityId: id });
  revalidateApp(deleted.slug);
  return { ok: true, data: undefined };
}

/* ------------------------------- Catatan --------------------------------- */

export async function createAppNote(
  appId: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await authorize("app.update");
  if (!actor) return FORBIDDEN;
  const parsed = appNoteInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const note = await dal.createAppNote(appId, parsed.data);
  if (!note) return NOT_FOUND;
  await logActivity({
    userId: actor.id,
    action: "app.note.create",
    entityType: "app",
    entityId: appId,
    metadata: { noteId: note.id, version: parsed.data.version },
  });
  revalidateApp(note.appSlug);
  return { ok: true, data: { id: note.id } };
}

export async function updateAppNote(noteId: string, input: unknown): Promise<ActionResult> {
  const actor = await authorize("app.update");
  if (!actor) return FORBIDDEN;
  const parsed = appNoteInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const note = await dal.updateAppNote(noteId, parsed.data);
  if (!note) return { ok: false, error: "Catatan tidak ditemukan." };
  await logActivity({
    userId: actor.id,
    action: "app.note.update",
    entityType: "app_note",
    entityId: noteId,
  });
  revalidateApp(note.appSlug);
  return { ok: true, data: undefined };
}

export async function deleteAppNote(noteId: string): Promise<ActionResult> {
  const actor = await authorize("app.update");
  if (!actor) return FORBIDDEN;

  const note = await dal.deleteAppNote(noteId);
  if (!note) return { ok: false, error: "Catatan tidak ditemukan." };
  await logActivity({
    userId: actor.id,
    action: "app.note.delete",
    entityType: "app",
    entityId: note.appId,
    metadata: { noteId },
  });
  revalidateApp(note.appSlug);
  return { ok: true, data: undefined };
}
