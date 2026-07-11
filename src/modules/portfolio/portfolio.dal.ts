import { and, asc, count, desc, eq, inArray, like, ne } from "drizzle-orm";
import { slugify } from "@/lib/slug";
import { getDb, type DB } from "@/server/db/client";
import {
  clients,
  media,
  portfolioFeatures,
  portfolioMedia,
  portfolioTechnologies,
  portfolios,
  technologies,
} from "@/server/db/schema";
import type { PortfolioStatus } from "./portfolio.schema";

export interface PortfolioFeatureData {
  title: string;
  description?: string;
}

export interface PortfolioWriteData {
  title: string;
  slug?: string;
  summary?: string;
  challenge?: string;
  solution?: string;
  timeline?: string;
  status: PortfolioStatus;
  demoUrl?: string;
  repoUrl?: string;
  thumbnailMediaId?: string;
  coverMediaId?: string;
  gallery: string[];
  clientId?: string;
  isConfidential: boolean;
  order: number;
  technologies: string[];
  features: PortfolioFeatureData[];
}

async function ensureUniqueSlug(db: DB, base: string, excludeId?: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let n = 1;
  for (;;) {
    const existing = await db
      .select({ id: portfolios.id })
      .from(portfolios)
      .where(eq(portfolios.slug, candidate))
      .limit(1);
    const row = existing[0];
    if (!row || row.id === excludeId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

async function replaceTechnologies(db: DB, portfolioId: string, names: string[]) {
  await db.delete(portfolioTechnologies).where(eq(portfolioTechnologies.portfolioId, portfolioId));
  const unique = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  if (unique.length === 0) return;

  const rows = unique.map((name) => ({ name, slug: slugify(name) }));
  await db.insert(technologies).values(rows).onConflictDoNothing();
  const found = await db
    .select({ id: technologies.id })
    .from(technologies)
    .where(
      inArray(
        technologies.slug,
        rows.map((r) => r.slug),
      ),
    );
  if (found.length > 0) {
    await db
      .insert(portfolioTechnologies)
      .values(found.map((t) => ({ portfolioId, technologyId: t.id })))
      .onConflictDoNothing();
  }
}

async function replaceFeatures(db: DB, portfolioId: string, features: PortfolioFeatureData[]) {
  await db.delete(portfolioFeatures).where(eq(portfolioFeatures.portfolioId, portfolioId));
  const clean = features.filter((f) => f.title.trim());
  if (clean.length > 0) {
    await db.insert(portfolioFeatures).values(
      clean.map((f, i) => ({
        portfolioId,
        title: f.title.trim(),
        description: f.description?.trim() || null,
        order: i,
      })),
    );
  }
}

function coreValues(data: PortfolioWriteData) {
  return {
    title: data.title,
    summary: data.summary?.trim() || null,
    challenge: data.challenge?.trim() || null,
    solution: data.solution?.trim() || null,
    timeline: data.timeline?.trim() || null,
    status: data.status,
    demoUrl: data.demoUrl?.trim() || null,
    repoUrl: data.repoUrl?.trim() || null,
    thumbnailMediaId: data.thumbnailMediaId || null,
    coverMediaId: data.coverMediaId || null,
    clientId: data.clientId || null,
    isConfidential: data.isConfidential,
    order: data.order,
  };
}

async function replaceGallery(db: DB, portfolioId: string, mediaIds: string[]) {
  await db.delete(portfolioMedia).where(eq(portfolioMedia.portfolioId, portfolioId));
  const unique = Array.from(new Set(mediaIds.filter(Boolean)));
  if (unique.length > 0) {
    await db
      .insert(portfolioMedia)
      .values(unique.map((mediaId, i) => ({ portfolioId, mediaId, order: i })));
  }
}

async function getMediaPick(db: DB, id: string | null) {
  if (!id) return null;
  const rows = await db
    .select({ id: media.id, url: media.url, filename: media.filename, kind: media.kind })
    .from(media)
    .where(eq(media.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/* --------------------------------- Admin --------------------------------- */

export async function createPortfolio(data: PortfolioWriteData) {
  const db = getDb();
  const slug = await ensureUniqueSlug(db, data.slug || data.title);
  const inserted = await db
    .insert(portfolios)
    .values({ ...coreValues(data), slug })
    .returning({ id: portfolios.id, slug: portfolios.slug });

  const created = inserted[0];
  if (created) {
    await replaceTechnologies(db, created.id, data.technologies);
    await replaceFeatures(db, created.id, data.features);
    await replaceGallery(db, created.id, data.gallery);
  }
  return created;
}

export async function updatePortfolio(id: string, data: PortfolioWriteData) {
  const db = getDb();
  const slug = await ensureUniqueSlug(db, data.slug || data.title, id);
  await db
    .update(portfolios)
    .set({ ...coreValues(data), slug })
    .where(eq(portfolios.id, id));
  await replaceTechnologies(db, id, data.technologies);
  await replaceFeatures(db, id, data.features);
  await replaceGallery(db, id, data.gallery);
  return { id, slug };
}

export async function deletePortfolio(id: string) {
  const db = getDb();
  await db.delete(portfolios).where(eq(portfolios.id, id));
}

export async function listPortfoliosAdmin(
  params: { page?: number; limit?: number; q?: string; status?: PortfolioStatus } = {},
) {
  const db = getDb();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 50));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.q) conditions.push(like(portfolios.title, `%${params.q}%`));
  if (params.status) conditions.push(eq(portfolios.status, params.status));
  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: portfolios.id,
      title: portfolios.title,
      slug: portfolios.slug,
      status: portfolios.status,
      isConfidential: portfolios.isConfidential,
      clientName: clients.name,
      updatedAt: portfolios.updatedAt,
    })
    .from(portfolios)
    .leftJoin(clients, eq(portfolios.clientId, clients.id))
    .where(where)
    .orderBy(asc(portfolios.order), desc(portfolios.updatedAt))
    .limit(limit)
    .offset(offset);

  const totalRows = await db.select({ value: count() }).from(portfolios).where(where);
  return { rows, total: totalRows[0]?.value ?? 0 };
}

export async function getPortfolioForEdit(id: string) {
  const db = getDb();
  const rows = await db.select().from(portfolios).where(eq(portfolios.id, id)).limit(1);
  const portfolio = rows[0];
  if (!portfolio) return null;

  const techRows = await db
    .select({ name: technologies.name })
    .from(portfolioTechnologies)
    .innerJoin(technologies, eq(portfolioTechnologies.technologyId, technologies.id))
    .where(eq(portfolioTechnologies.portfolioId, id));

  const featureRows = await db
    .select({ title: portfolioFeatures.title, description: portfolioFeatures.description })
    .from(portfolioFeatures)
    .where(eq(portfolioFeatures.portfolioId, id))
    .orderBy(asc(portfolioFeatures.order));

  const gallery = await db
    .select({ id: media.id, url: media.url, filename: media.filename, kind: media.kind })
    .from(portfolioMedia)
    .innerJoin(media, eq(portfolioMedia.mediaId, media.id))
    .where(eq(portfolioMedia.portfolioId, id))
    .orderBy(asc(portfolioMedia.order));

  return {
    ...portfolio,
    technologies: techRows.map((t) => t.name),
    features: featureRows.map((f) => ({ title: f.title, description: f.description ?? "" })),
    thumbnail: await getMediaPick(db, portfolio.thumbnailMediaId),
    cover: await getMediaPick(db, portfolio.coverMediaId),
    gallery,
  };
}

export async function listClientsForSelect() {
  const db = getDb();
  return db.select({ id: clients.id, name: clients.name }).from(clients).orderBy(asc(clients.name));
}

/* -------------------------------- Public --------------------------------- */

export async function listPublishedPortfolios() {
  const db = getDb();
  return db
    .select({
      title: portfolios.title,
      slug: portfolios.slug,
      summary: portfolios.summary,
      status: portfolios.status,
      isConfidential: portfolios.isConfidential,
      clientName: clients.name,
      thumbnailUrl: media.url,
    })
    .from(portfolios)
    .leftJoin(clients, eq(portfolios.clientId, clients.id))
    .leftJoin(media, eq(portfolios.thumbnailMediaId, media.id))
    .where(ne(portfolios.status, "archived"))
    .orderBy(asc(portfolios.order), desc(portfolios.createdAt));
}

export async function getPublishedPortfolioBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: portfolios.id,
      title: portfolios.title,
      slug: portfolios.slug,
      summary: portfolios.summary,
      challenge: portfolios.challenge,
      solution: portfolios.solution,
      timeline: portfolios.timeline,
      status: portfolios.status,
      demoUrl: portfolios.demoUrl,
      repoUrl: portfolios.repoUrl,
      isConfidential: portfolios.isConfidential,
      clientName: clients.name,
      coverUrl: media.url,
    })
    .from(portfolios)
    .leftJoin(clients, eq(portfolios.clientId, clients.id))
    .leftJoin(media, eq(portfolios.coverMediaId, media.id))
    .where(and(eq(portfolios.slug, slug), ne(portfolios.status, "archived")))
    .limit(1);

  const portfolio = rows[0];
  if (!portfolio) return null;

  const techRows = await db
    .select({ name: technologies.name })
    .from(portfolioTechnologies)
    .innerJoin(technologies, eq(portfolioTechnologies.technologyId, technologies.id))
    .where(eq(portfolioTechnologies.portfolioId, portfolio.id));

  const featureRows = await db
    .select({ title: portfolioFeatures.title, description: portfolioFeatures.description })
    .from(portfolioFeatures)
    .where(eq(portfolioFeatures.portfolioId, portfolio.id))
    .orderBy(asc(portfolioFeatures.order));

  const gallery = await db
    .select({ url: media.url, filename: media.filename })
    .from(portfolioMedia)
    .innerJoin(media, eq(portfolioMedia.mediaId, media.id))
    .where(eq(portfolioMedia.portfolioId, portfolio.id))
    .orderBy(asc(portfolioMedia.order));

  return {
    ...portfolio,
    clientName: portfolio.isConfidential ? null : portfolio.clientName,
    technologies: techRows.map((t) => t.name),
    features: featureRows,
    gallery,
  };
}
