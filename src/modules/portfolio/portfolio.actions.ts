"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { FORBIDDEN, invalid, type ActionResult } from "@/lib/action";
import { logActivity } from "@/server/activity-log";
import { requirePermission } from "@/server/rbac/guard";
import * as dal from "./portfolio.dal";
import { portfolioInputSchema, type PortfolioInput } from "./portfolio.schema";

function toWriteData(input: PortfolioInput): dal.PortfolioWriteData {
  return {
    title: input.title,
    slug: input.slug,
    summary: input.summary,
    challenge: input.challenge,
    solution: input.solution,
    timeline: input.timeline,
    status: input.status,
    demoUrl: input.demoUrl,
    repoUrl: input.repoUrl,
    thumbnailMediaId: input.thumbnailMediaId,
    coverMediaId: input.coverMediaId,
    gallery: input.galleryMediaIds ?? [],
    clientId: input.clientId || undefined,
    isConfidential: input.isConfidential,
    order: input.order,
    technologies: input.technologies ?? [],
    features: input.features ?? [],
  };
}

function revalidate(slug?: string) {
  revalidatePath("/portfolio");
  if (slug) revalidatePath(`/portfolio/${slug}`);
}

export async function createPortfolio(
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  let actor;
  try {
    actor = await requirePermission("portfolio.create");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  const parsed = portfolioInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const created = await dal.createPortfolio(toWriteData(parsed.data));
  if (!created) return { ok: false, error: "Gagal membuat portfolio." };
  await logActivity({ userId: actor.id, action: "portfolio.create", entityType: "portfolio", entityId: created.id });
  revalidate(created.slug);
  return { ok: true, data: created };
}

export async function updatePortfolio(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  let actor;
  try {
    actor = await requirePermission("portfolio.update");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  const parsed = portfolioInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const updated = await dal.updatePortfolio(id, toWriteData(parsed.data));
  await logActivity({ userId: actor.id, action: "portfolio.update", entityType: "portfolio", entityId: id });
  revalidate(updated.slug);
  return { ok: true, data: updated };
}

export async function deletePortfolio(id: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("portfolio.delete");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  await dal.deletePortfolio(id);
  await logActivity({ userId: actor.id, action: "portfolio.delete", entityType: "portfolio", entityId: id });
  revalidate();
  return { ok: true, data: undefined };
}
