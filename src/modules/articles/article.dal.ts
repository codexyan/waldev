import { and, count, desc, eq, inArray, like, lte, ne } from "drizzle-orm";
import { slugify } from "@/lib/slug";
import { calcReadingTime, renderTiptapToHtml } from "@/lib/tiptap";
import { getDb, type DB } from "@/server/db/client";
import {
  articleTags,
  articles,
  categories,
  media,
  tags as tagsTable,
  user,
} from "@/server/db/schema";
import type { ArticleStatus } from "./article.schema";

export interface ArticleWriteData {
  title: string;
  slug?: string;
  summary?: string | null;
  coverMediaId?: string | null;
  contentJson: unknown;
  categoryId?: string | null;
  tags: string[];
  status: ArticleStatus;
  scheduledAt?: string | null;
}

async function ensureUniqueSlug(db: DB, base: string, excludeId?: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let n = 1;
  // Cari slug bebas: root, root-2, root-3, ...
  for (;;) {
    const existing = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, candidate))
      .limit(1);
    const row = existing[0];
    if (!row || row.id === excludeId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

async function upsertTags(db: DB, names: string[]): Promise<string[]> {
  const unique = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  if (unique.length === 0) return [];

  const slugs = unique.map((name) => ({ name, slug: slugify(name) }));
  await db
    .insert(tagsTable)
    .values(slugs.map((s) => ({ name: s.name, slug: s.slug })))
    .onConflictDoNothing();

  const rows = await db
    .select({ id: tagsTable.id })
    .from(tagsTable)
    .where(
      inArray(
        tagsTable.slug,
        slugs.map((s) => s.slug),
      ),
    );
  return rows.map((r) => r.id);
}

async function replaceArticleTags(db: DB, articleId: string, tagIds: string[]): Promise<void> {
  await db.delete(articleTags).where(eq(articleTags.articleId, articleId));
  if (tagIds.length > 0) {
    await db.insert(articleTags).values(tagIds.map((tagId) => ({ articleId, tagId })));
  }
}

function computeDates(status: ArticleStatus, scheduledAt?: string | null) {
  return {
    publishedAt: status === "published" ? new Date() : null,
    scheduledAt: status === "scheduled" && scheduledAt ? new Date(scheduledAt) : null,
  };
}

/* --------------------------------- Admin --------------------------------- */

export async function createArticle(data: ArticleWriteData, authorId: string) {
  const db = getDb();
  const slug = await ensureUniqueSlug(db, data.slug || data.title);
  const { publishedAt, scheduledAt } = computeDates(data.status, data.scheduledAt);

  const inserted = await db
    .insert(articles)
    .values({
      title: data.title,
      slug,
      summary: data.summary?.trim() || null,
      coverMediaId: data.coverMediaId || null,
      categoryId: data.categoryId || null,
      authorId,
      contentJson: JSON.stringify(data.contentJson ?? { type: "doc", content: [] }),
      contentHtml: renderTiptapToHtml(data.contentJson),
      readingTime: calcReadingTime(data.contentJson),
      status: data.status,
      publishedAt,
      scheduledAt,
    })
    .returning({ id: articles.id, slug: articles.slug });

  const created = inserted[0];
  if (created) {
    await replaceArticleTags(db, created.id, await upsertTags(db, data.tags));
  }
  return created;
}

export async function updateArticle(id: string, data: ArticleWriteData) {
  const db = getDb();
  const slug = await ensureUniqueSlug(db, data.slug || data.title, id);
  const { publishedAt, scheduledAt } = computeDates(data.status, data.scheduledAt);

  await db
    .update(articles)
    .set({
      title: data.title,
      slug,
      summary: data.summary?.trim() || null,
      coverMediaId: data.coverMediaId || null,
      categoryId: data.categoryId || null,
      contentJson: JSON.stringify(data.contentJson ?? { type: "doc", content: [] }),
      contentHtml: renderTiptapToHtml(data.contentJson),
      readingTime: calcReadingTime(data.contentJson),
      status: data.status,
      publishedAt,
      scheduledAt,
    })
    .where(eq(articles.id, id));

  await replaceArticleTags(db, id, await upsertTags(db, data.tags));
  return { id, slug };
}

export async function deleteArticle(id: string) {
  const db = getDb();
  await db.delete(articles).where(eq(articles.id, id));
}

export async function setArticleStatus(id: string, status: ArticleStatus) {
  const db = getDb();
  await db
    .update(articles)
    .set({
      status,
      publishedAt: status === "published" ? new Date() : null,
    })
    .where(eq(articles.id, id));
}

export interface ListArticlesParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: ArticleStatus;
}

export async function listArticlesAdmin(params: ListArticlesParams = {}) {
  const db = getDb();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.q) conditions.push(like(articles.title, `%${params.q}%`));
  if (params.status) conditions.push(eq(articles.status, params.status));
  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      status: articles.status,
      readingTime: articles.readingTime,
      publishedAt: articles.publishedAt,
      updatedAt: articles.updatedAt,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)
    .orderBy(desc(articles.updatedAt))
    .limit(limit)
    .offset(offset);

  const totalRows = await db.select({ value: count() }).from(articles).where(where);
  const total = totalRows[0]?.value ?? 0;

  return { rows, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getArticleForEdit(id: string) {
  const db = getDb();
  const rows = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  const article = rows[0];
  if (!article) return null;

  const tagRows = await db
    .select({ name: tagsTable.name })
    .from(articleTags)
    .innerJoin(tagsTable, eq(articleTags.tagId, tagsTable.id))
    .where(eq(articleTags.articleId, id));

  let cover:
    | { id: string; url: string; filename: string; kind: "image" | "pdf" | "document" }
    | null = null;
  if (article.coverMediaId) {
    const m = await db
      .select({ id: media.id, url: media.url, filename: media.filename, kind: media.kind })
      .from(media)
      .where(eq(media.id, article.coverMediaId))
      .limit(1);
    cover = m[0] ?? null;
  }

  return { ...article, tags: tagRows.map((t) => t.name), cover };
}

export async function listArticleCategories() {
  const db = getDb();
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.type, "article"))
    .orderBy(categories.name);
}

/* -------------------------------- Public --------------------------------- */

export async function listPublishedArticles(params: { page?: number; limit?: number } = {}) {
  const db = getDb();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 12));
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      title: articles.title,
      slug: articles.slug,
      summary: articles.summary,
      readingTime: articles.readingTime,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      coverUrl: media.url,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(media, eq(articles.coverMediaId, media.id))
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

  const totalRows = await db
    .select({ value: count() })
    .from(articles)
    .where(eq(articles.status, "published"));
  const total = totalRows[0]?.value ?? 0;

  return { rows, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getPublishedArticleBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      summary: articles.summary,
      contentHtml: articles.contentHtml,
      readingTime: articles.readingTime,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      authorName: user.name,
      coverUrl: media.url,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .leftJoin(user, eq(articles.authorId, user.id))
    .leftJoin(media, eq(articles.coverMediaId, media.id))
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);

  const article = rows[0];
  if (!article) return null;

  const tagRows = await db
    .select({ name: tagsTable.name, slug: tagsTable.slug })
    .from(articleTags)
    .innerJoin(tagsTable, eq(articleTags.tagId, tagsTable.id))
    .where(eq(articleTags.articleId, article.id));

  return { ...article, tags: tagRows };
}

export async function getRelatedArticles(excludeId: string, limit = 3) {
  const db = getDb();
  return db
    .select({
      title: articles.title,
      slug: articles.slug,
      summary: articles.summary,
      readingTime: articles.readingTime,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(and(eq(articles.status, "published"), ne(articles.id, excludeId)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

export async function getAllPublishedSlugs() {
  const db = getDb();
  const rows = await db
    .select({ slug: articles.slug })
    .from(articles)
    .where(eq(articles.status, "published"));
  return rows.map((r) => r.slug);
}

/** Untuk cron: publikasikan artikel terjadwal yang waktunya sudah tiba. */
export async function publishDueScheduled(): Promise<number> {
  const db = getDb();
  const now = new Date();
  const due = await db
    .select({ id: articles.id })
    .from(articles)
    .where(and(eq(articles.status, "scheduled"), lte(articles.scheduledAt, now)));

  for (const row of due) {
    await db
      .update(articles)
      .set({ status: "published", publishedAt: now })
      .where(eq(articles.id, row.id));
  }
  return due.length;
}
