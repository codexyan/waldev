import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { collaborationRequests, contactMessages } from "@/server/db/schema";
import type { CollaborationStatus, ContactStatus } from "./lead.schema";

/* Collaboration */

export async function createCollaboration(data: {
  name: string;
  email: string;
  whatsapp?: string;
  company?: string;
  budget?: string;
  deadline?: string;
  projectType?: string;
  description: string;
}) {
  const db = getDb();
  const inserted = await db
    .insert(collaborationRequests)
    .values({
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp?.trim() || null,
      company: data.company?.trim() || null,
      budget: data.budget?.trim() || null,
      deadline: data.deadline?.trim() || null,
      projectType: data.projectType?.trim() || null,
      description: data.description,
    })
    .returning({ id: collaborationRequests.id });
  return inserted[0];
}

export async function listCollaborations() {
  const db = getDb();
  return db
    .select({
      id: collaborationRequests.id,
      name: collaborationRequests.name,
      email: collaborationRequests.email,
      company: collaborationRequests.company,
      projectType: collaborationRequests.projectType,
      budget: collaborationRequests.budget,
      status: collaborationRequests.status,
      createdAt: collaborationRequests.createdAt,
    })
    .from(collaborationRequests)
    .orderBy(desc(collaborationRequests.createdAt));
}

export async function getCollaboration(id: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(collaborationRequests)
    .where(eq(collaborationRequests.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateCollaborationStatus(id: string, status: CollaborationStatus) {
  const db = getDb();
  await db
    .update(collaborationRequests)
    .set({ status })
    .where(eq(collaborationRequests.id, id));
}

export async function updateCollaborationNotes(id: string, notes: string) {
  const db = getDb();
  await db
    .update(collaborationRequests)
    .set({ adminNotes: notes.trim() || null })
    .where(eq(collaborationRequests.id, id));
}

export async function deleteCollaboration(id: string) {
  const db = getDb();
  await db.delete(collaborationRequests).where(eq(collaborationRequests.id, id));
}

/* Contact */

export async function createContact(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const db = getDb();
  const inserted = await db
    .insert(contactMessages)
    .values({
      name: data.name,
      email: data.email,
      subject: data.subject?.trim() || null,
      message: data.message,
    })
    .returning({ id: contactMessages.id });
  return inserted[0];
}

export async function listContacts() {
  const db = getDb();
  return db
    .select({
      id: contactMessages.id,
      name: contactMessages.name,
      email: contactMessages.email,
      subject: contactMessages.subject,
      message: contactMessages.message,
      status: contactMessages.status,
      createdAt: contactMessages.createdAt,
    })
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));
}

export async function updateContactStatus(id: string, status: ContactStatus) {
  const db = getDb();
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
}

export async function deleteContact(id: string) {
  const db = getDb();
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
}

/* Counts (dashboard) */

export async function countNewCollaborations(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ value: count() })
    .from(collaborationRequests)
    .where(eq(collaborationRequests.status, "new"));
  return rows[0]?.value ?? 0;
}

export async function countNewContacts(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ value: count() })
    .from(contactMessages)
    .where(eq(contactMessages.status, "new"));
  return rows[0]?.value ?? 0;
}
