"use server";

import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { FORBIDDEN, invalid, type ActionResult } from "@/lib/action";
import { logActivity } from "@/server/activity-log";
import { notifyNewLead } from "@/server/notify";
import { checkRateLimit } from "@/server/rate-limit";
import { requirePermission } from "@/server/rbac/guard";
import { verifyTurnstile } from "@/server/turnstile";
import * as dal from "./lead.dal";
import {
  COLLABORATION_STATUSES,
  CONTACT_STATUSES,
  collaborationSubmitSchema,
  contactSubmitSchema,
  type CollaborationStatus,
  type ContactStatus,
} from "./lead.schema";

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for") ?? "unknown";
}

/* ------------------------------ Public submit ---------------------------- */

export async function submitCollaboration(input: unknown): Promise<ActionResult> {
  const parsed = collaborationSubmitSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const ip = await clientIp();
  if (!(await checkRateLimit(`collab:${ip}`, 5, 3600))) {
    return { ok: false, error: "Terlalu banyak permintaan. Silakan coba lagi nanti." };
  }
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return { ok: false, error: "Verifikasi anti-bot gagal. Muat ulang halaman." };
  }

  await dal.createCollaboration(parsed.data);
  await notifyNewLead({
    subject: `Lead baru: ${parsed.data.name}`,
    text: `${parsed.data.name} <${parsed.data.email}>\nWhatsApp: ${parsed.data.whatsapp ?? "-"}\nPerusahaan: ${parsed.data.company ?? "-"}\nJenis: ${parsed.data.projectType ?? "-"}\nBudget: ${parsed.data.budget ?? "-"}\nDeadline: ${parsed.data.deadline ?? "-"}\n\n${parsed.data.description}`,
  });
  return { ok: true, data: undefined };
}

export async function submitContact(input: unknown): Promise<ActionResult> {
  const parsed = contactSubmitSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const ip = await clientIp();
  if (!(await checkRateLimit(`contact:${ip}`, 5, 3600))) {
    return { ok: false, error: "Terlalu banyak permintaan. Silakan coba lagi nanti." };
  }
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return { ok: false, error: "Verifikasi anti-bot gagal. Muat ulang halaman." };
  }

  await dal.createContact(parsed.data);
  await notifyNewLead({
    subject: `Pesan kontak: ${parsed.data.name}`,
    text: `${parsed.data.name} <${parsed.data.email}>\nSubjek: ${parsed.data.subject ?? "-"}\n\n${parsed.data.message}`,
  });
  return { ok: true, data: undefined };
}

/* -------------------------------- Admin ---------------------------------- */

export async function updateCollaborationStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("lead.update");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  if (!(COLLABORATION_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Status tidak valid." };
  }
  await dal.updateCollaborationStatus(id, status as CollaborationStatus);
  await logActivity({ userId: actor.id, action: "lead.update", entityType: "collaboration", entityId: id, metadata: { status } });
  return { ok: true, data: undefined };
}

export async function updateContactStatusAction(id: string, status: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("lead.update");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  if (!(CONTACT_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Status tidak valid." };
  }
  await dal.updateContactStatus(id, status as ContactStatus);
  await logActivity({ userId: actor.id, action: "lead.update", entityType: "contact", entityId: id, metadata: { status } });
  return { ok: true, data: undefined };
}

export async function deleteCollaborationAction(id: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requirePermission("lead.update");
  } catch (e) {
    unstable_rethrow(e);
    return FORBIDDEN;
  }
  await dal.deleteCollaboration(id);
  await logActivity({ userId: actor.id, action: "lead.delete", entityType: "collaboration", entityId: id });
  return { ok: true, data: undefined };
}
