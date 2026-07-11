"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { FORBIDDEN, invalid, type ActionResult } from "@/lib/action";
import { logActivity } from "@/server/activity-log";
import { requirePermission } from "@/server/rbac/guard";
import { upsertSeoMeta } from "@/modules/seo/seo.dal";
import * as dal from "./service.dal";
import { serviceInputSchema, type ServiceInput } from "./service.schema";

function toWriteData(input: ServiceInput): dal.ServiceWriteData {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description,
    price: input.price,
    ctaLabel: input.ctaLabel,
    ctaUrl: input.ctaUrl,
    status: input.status,
    order: input.order,
    features: input.features ?? [],
    workflow: input.workflow ?? [],
    faqs: input.faqs ?? [],
  };
}

function revalidate(slug?: string) {
  revalidatePath("/services");
  if (slug) revalidatePath(`/services/${slug}`);
}

export async function createService(
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  let actor;
  try {
    actor = await requirePermission("service.create");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  const parsed = serviceInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const created = await dal.createService(toWriteData(parsed.data));
  if (!created) return { ok: false, error: "Gagal membuat layanan." };
  await upsertSeoMeta("service", created.id, {
    metaTitle: parsed.data.metaTitle,
    metaDescription: parsed.data.metaDescription,
    noIndex: parsed.data.noIndex,
  });
  await logActivity({ userId: actor.id, action: "service.create", entityType: "service", entityId: created.id });
  revalidate(created.slug);
  return { ok: true, data: created };
}

export async function updateService(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  let actor;
  try {
    actor = await requirePermission("service.update");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  const parsed = serviceInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const updated = await dal.updateService(id, toWriteData(parsed.data));
  await upsertSeoMeta("service", id, {
    metaTitle: parsed.data.metaTitle,
    metaDescription: parsed.data.metaDescription,
    noIndex: parsed.data.noIndex,
  });
  await logActivity({ userId: actor.id, action: "service.update", entityType: "service", entityId: id });
  revalidate(updated.slug);
  return { ok: true, data: updated };
}

export async function deleteService(id: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("service.delete");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  await dal.deleteService(id);
  await logActivity({ userId: actor.id, action: "service.delete", entityType: "service", entityId: id });
  revalidate();
  return { ok: true, data: undefined };
}
