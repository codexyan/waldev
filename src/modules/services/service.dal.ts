import { and, asc, count, desc, eq, like } from "drizzle-orm";
import { slugify } from "@/lib/slug";
import { getDb, type DB } from "@/server/db/client";
import {
  serviceFaqs,
  serviceFeatures,
  serviceWorkflowSteps,
  services,
} from "@/server/db/schema";
import type { ServiceStatus } from "./service.schema";

export interface ServiceItemData {
  title: string;
  description?: string;
}
export interface ServiceFaqData {
  question: string;
  answer: string;
}

export interface ServiceWriteData {
  name: string;
  slug?: string;
  description?: string;
  price?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  status: ServiceStatus;
  order: number;
  features: ServiceItemData[];
  workflow: ServiceItemData[];
  faqs: ServiceFaqData[];
}

async function ensureUniqueSlug(db: DB, base: string, excludeId?: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let n = 1;
  for (;;) {
    const existing = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, candidate))
      .limit(1);
    const row = existing[0];
    if (!row || row.id === excludeId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

async function replaceChildren(db: DB, serviceId: string, data: ServiceWriteData) {
  await db.delete(serviceFeatures).where(eq(serviceFeatures.serviceId, serviceId));
  await db.delete(serviceWorkflowSteps).where(eq(serviceWorkflowSteps.serviceId, serviceId));
  await db.delete(serviceFaqs).where(eq(serviceFaqs.serviceId, serviceId));

  const features = data.features.filter((f) => f.title.trim());
  if (features.length > 0) {
    await db.insert(serviceFeatures).values(
      features.map((f, i) => ({
        serviceId,
        title: f.title.trim(),
        description: f.description?.trim() || null,
        order: i,
      })),
    );
  }

  const workflow = data.workflow.filter((w) => w.title.trim());
  if (workflow.length > 0) {
    await db.insert(serviceWorkflowSteps).values(
      workflow.map((w, i) => ({
        serviceId,
        stepNumber: i + 1,
        title: w.title.trim(),
        description: w.description?.trim() || null,
      })),
    );
  }

  const faqs = data.faqs.filter((f) => f.question.trim() && f.answer.trim());
  if (faqs.length > 0) {
    await db.insert(serviceFaqs).values(
      faqs.map((f, i) => ({
        serviceId,
        question: f.question.trim(),
        answer: f.answer.trim(),
        order: i,
      })),
    );
  }
}

function coreValues(data: ServiceWriteData) {
  return {
    name: data.name,
    description: data.description?.trim() || null,
    price: data.price?.trim() || null,
    ctaLabel: data.ctaLabel?.trim() || null,
    ctaUrl: data.ctaUrl?.trim() || null,
    status: data.status,
    order: data.order,
  };
}

/* --------------------------------- Admin --------------------------------- */

export async function createService(data: ServiceWriteData) {
  const db = getDb();
  const slug = await ensureUniqueSlug(db, data.slug || data.name);
  const inserted = await db
    .insert(services)
    .values({ ...coreValues(data), slug })
    .returning({ id: services.id, slug: services.slug });
  const created = inserted[0];
  if (created) await replaceChildren(db, created.id, data);
  return created;
}

export async function updateService(id: string, data: ServiceWriteData) {
  const db = getDb();
  const slug = await ensureUniqueSlug(db, data.slug || data.name, id);
  await db.update(services).set({ ...coreValues(data), slug }).where(eq(services.id, id));
  await replaceChildren(db, id, data);
  return { id, slug };
}

export async function deleteService(id: string) {
  const db = getDb();
  await db.delete(services).where(eq(services.id, id));
}

export async function listServicesAdmin(
  params: { q?: string; status?: ServiceStatus } = {},
) {
  const db = getDb();
  const conditions = [];
  if (params.q) conditions.push(like(services.name, `%${params.q}%`));
  if (params.status) conditions.push(eq(services.status, params.status));
  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: services.id,
      name: services.name,
      slug: services.slug,
      status: services.status,
      price: services.price,
      updatedAt: services.updatedAt,
    })
    .from(services)
    .where(where)
    .orderBy(asc(services.order), desc(services.updatedAt));

  const totalRows = await db.select({ value: count() }).from(services).where(where);
  return { rows, total: totalRows[0]?.value ?? 0 };
}

async function loadChildren(db: DB, serviceId: string) {
  const features = await db
    .select({ title: serviceFeatures.title, description: serviceFeatures.description })
    .from(serviceFeatures)
    .where(eq(serviceFeatures.serviceId, serviceId))
    .orderBy(asc(serviceFeatures.order));
  const workflow = await db
    .select({ title: serviceWorkflowSteps.title, description: serviceWorkflowSteps.description })
    .from(serviceWorkflowSteps)
    .where(eq(serviceWorkflowSteps.serviceId, serviceId))
    .orderBy(asc(serviceWorkflowSteps.stepNumber));
  const faqs = await db
    .select({ question: serviceFaqs.question, answer: serviceFaqs.answer })
    .from(serviceFaqs)
    .where(eq(serviceFaqs.serviceId, serviceId))
    .orderBy(asc(serviceFaqs.order));
  return { features, workflow, faqs };
}

export async function getServiceForEdit(id: string) {
  const db = getDb();
  const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
  const service = rows[0];
  if (!service) return null;
  const children = await loadChildren(db, id);
  return {
    ...service,
    features: children.features.map((f) => ({ title: f.title, description: f.description ?? "" })),
    workflow: children.workflow.map((w) => ({ title: w.title, description: w.description ?? "" })),
    faqs: children.faqs.map((f) => ({ question: f.question, answer: f.answer })),
  };
}

/* -------------------------------- Public --------------------------------- */

export async function listActiveServices() {
  const db = getDb();
  return db
    .select({
      name: services.name,
      slug: services.slug,
      description: services.description,
      price: services.price,
    })
    .from(services)
    .where(eq(services.status, "active"))
    .orderBy(asc(services.order), asc(services.name));
}

export async function getActiveServiceBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(services)
    .where(and(eq(services.slug, slug), eq(services.status, "active")))
    .limit(1);
  const service = rows[0];
  if (!service) return null;
  const children = await loadChildren(db, service.id);
  return { ...service, ...children };
}
