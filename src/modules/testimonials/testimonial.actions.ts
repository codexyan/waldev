"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { FORBIDDEN, invalid, type ActionResult } from "@/lib/action";
import { logActivity } from "@/server/activity-log";
import { requirePermission } from "@/server/rbac/guard";
import * as dal from "./testimonial.dal";
import { testimonialInputSchema, type TestimonialInput } from "./testimonial.schema";

function toWriteData(input: TestimonialInput): dal.TestimonialWriteData {
  return {
    authorName: input.authorName,
    authorRole: input.authorRole,
    company: input.company,
    photoMediaId: input.photoMediaId,
    content: input.content,
    rating: input.rating,
    status: input.status,
    clientId: input.clientId,
    order: input.order,
  };
}

export async function createTestimonialAction(input: unknown): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("testimonial.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  const parsed = testimonialInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  await dal.createTestimonial(toWriteData(parsed.data));
  await logActivity({ userId: actor.id, action: "testimonial.create", entityType: "testimonial" });
  revalidatePath("/testimonials");
  return { ok: true, data: undefined };
}

export async function updateTestimonialAction(id: string, input: unknown): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("testimonial.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  const parsed = testimonialInputSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  await dal.updateTestimonial(id, toWriteData(parsed.data));
  await logActivity({ userId: actor.id, action: "testimonial.update", entityType: "testimonial", entityId: id });
  revalidatePath("/testimonials");
  return { ok: true, data: undefined };
}

export async function deleteTestimonialAction(id: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("testimonial.manage");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  await dal.deleteTestimonial(id);
  await logActivity({ userId: actor.id, action: "testimonial.delete", entityType: "testimonial", entityId: id });
  revalidatePath("/testimonials");
  return { ok: true, data: undefined };
}
