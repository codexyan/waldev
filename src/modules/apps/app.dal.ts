import { and, asc, count, desc, eq, inArray, like, sql } from "drizzle-orm";
import { slugify } from "@/lib/slug";
import { EMPTY_DOC, renderTiptapToHtml } from "@/lib/tiptap";
import { getDb, type DB } from "@/server/db/client";
import {
  appFaqs,
  appFeatures,
  appMedia,
  appNotes,
  appTechnologies,
  apps,
  articles,
  media,
  technologies,
} from "@/server/db/schema";
import type { AppStatus } from "./app.schema";

export interface AppFeatureData {
  title: string;
  description?: string;
}

export interface AppFaqData {
  question: string;
  answer: string;
}

export interface AppWriteData {
  name: string;
  slug?: string;
  tagline?: string;
  descriptionJson: unknown;
  status: AppStatus;
  isPublished: boolean;
  appUrl?: string;
  repoUrl?: string;
  videoUrl?: string;
  coverMediaId?: string;
  gallery: string[];
  startedAt?: string | null;
  releasedAt?: string | null;
  retiredAt?: string | null;
  technologies: string[];
  features: AppFeatureData[];
  guideJson: unknown;
  faqs: AppFaqData[];
  showGuide: boolean;
  showFaq: boolean;
  showNotes: boolean;
  showReleases: boolean;
}

export interface AppNoteWriteData {
  body: string;
  version?: string;
  notedAt?: string | null;
}

/* -------------------------------- Helpers -------------------------------- */

/**
 * Tanggal catatan terakhir sebuah aplikasi: catatan pendek, atau artikel terkait
 * yang sudah tayang. Dihitung saat query, tidak disimpan, karena jumlah
 * aplikasinya kecil. Nilainya detik epoch mentah dari SQLite.
 *
 * Rujukan ke baris luar sengaja ditulis `"apps"."id"`, bukan `${apps.id}`. Pada
 * query satu tabel Drizzle menulis kolom tanpa nama tabel, sehingga `"id"` di
 * dalam subquery terbaca sebagai id tabel catatan/artikel dan hasilnya selalu
 * kosong.
 */
const lastNoteAt = sql<
  number | null
>`(select max(${appNotes.notedAt}) from ${appNotes} where ${appNotes.appId} = "apps"."id")`;

const lastArticleAt = sql<
  number | null
>`(select max(${articles.publishedAt}) from ${articles} where ${articles.appId} = "apps"."id" and ${articles.status} = 'published')`;

function withLastActivity<T extends { lastNoteAt: number | null; lastArticleAt: number | null }>(
  row: T,
) {
  const { lastNoteAt: noteAt, lastArticleAt: articleAt, ...rest } = row;
  const latest = Math.max(noteAt ?? 0, articleAt ?? 0);
  return { ...rest, lastActivityAt: latest > 0 ? new Date(latest * 1000) : null };
}

/**
 * Tanggal dari <input type="date"> hanya berisi hari. Disimpan pukul 12.00 UTC
 * supaya tidak bergeser ke hari lain saat ditampilkan di zona waktu Indonesia.
 */
function toDay(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Aplikasi berstatus rilis/pensiun selalu punya tanggalnya, karena halaman
 * aplikasi pensiun menulis "tidak aktif lagi sejak {bulan tahun}". Isian yang
 * kosong diisi dari nilai lama, atau hari ini bila memang belum pernah ada.
 */
function resolveMilestones(
  data: AppWriteData,
  existing?: { releasedAt: Date | null; retiredAt: Date | null },
) {
  const now = new Date();
  return {
    releasedAt:
      toDay(data.releasedAt) ??
      (data.status === "building" ? null : (existing?.releasedAt ?? now)),
    retiredAt:
      toDay(data.retiredAt) ?? (data.status === "retired" ? (existing?.retiredAt ?? now) : null),
  };
}

function coreValues(
  data: AppWriteData,
  existing?: { releasedAt: Date | null; retiredAt: Date | null },
) {
  return {
    name: data.name,
    tagline: data.tagline?.trim() || null,
    descriptionJson: JSON.stringify(data.descriptionJson ?? EMPTY_DOC),
    descriptionHtml: renderTiptapToHtml(data.descriptionJson),
    status: data.status,
    isPublished: data.isPublished,
    appUrl: data.appUrl?.trim() || null,
    repoUrl: data.repoUrl?.trim() || null,
    videoUrl: data.videoUrl?.trim() || null,
    coverMediaId: data.coverMediaId || null,
    startedAt: toDay(data.startedAt),
    ...resolveMilestones(data, existing),
    guideJson: JSON.stringify(data.guideJson ?? EMPTY_DOC),
    guideHtml: renderTiptapToHtml(data.guideJson),
    showGuide: data.showGuide,
    showFaq: data.showFaq,
    showNotes: data.showNotes,
    showReleases: data.showReleases,
  };
}

async function ensureUniqueSlug(db: DB, base: string, excludeId?: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let n = 1;
  for (;;) {
    const existing = await db
      .select({ id: apps.id })
      .from(apps)
      .where(eq(apps.slug, candidate))
      .limit(1);
    const row = existing[0];
    if (!row || row.id === excludeId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

async function replaceTechnologies(db: DB, appId: string, names: string[]) {
  await db.delete(appTechnologies).where(eq(appTechnologies.appId, appId));
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
      .insert(appTechnologies)
      .values(found.map((t) => ({ appId, technologyId: t.id })))
      .onConflictDoNothing();
  }
}

async function replaceFeatures(db: DB, appId: string, features: AppFeatureData[]) {
  await db.delete(appFeatures).where(eq(appFeatures.appId, appId));
  const clean = features.filter((f) => f.title.trim());
  if (clean.length > 0) {
    await db.insert(appFeatures).values(
      clean.map((f, i) => ({
        appId,
        title: f.title.trim(),
        description: f.description?.trim() || null,
        order: i,
      })),
    );
  }
}

async function replaceFaqs(db: DB, appId: string, faqs: AppFaqData[]) {
  await db.delete(appFaqs).where(eq(appFaqs.appId, appId));
  const clean = faqs.filter((f) => f.question.trim() && f.answer.trim());
  if (clean.length > 0) {
    await db.insert(appFaqs).values(
      clean.map((f, i) => ({
        appId,
        question: f.question.trim(),
        answer: f.answer.trim(),
        order: i,
      })),
    );
  }
}

async function replaceGallery(db: DB, appId: string, mediaIds: string[]) {
  await db.delete(appMedia).where(eq(appMedia.appId, appId));
  const unique = Array.from(new Set(mediaIds.filter(Boolean)));
  if (unique.length > 0) {
    await db.insert(appMedia).values(unique.map((mediaId, i) => ({ appId, mediaId, order: i })));
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

async function getAppSlug(db: DB, appId: string): Promise<string | null> {
  const rows = await db.select({ slug: apps.slug }).from(apps).where(eq(apps.id, appId)).limit(1);
  return rows[0]?.slug ?? null;
}

/* --------------------------------- Admin --------------------------------- */

export async function createApp(data: AppWriteData) {
  const db = getDb();
  const slug = await ensureUniqueSlug(db, data.slug || data.name);
  const inserted = await db
    .insert(apps)
    .values({ ...coreValues(data), slug })
    .returning({ id: apps.id, slug: apps.slug });

  const created = inserted[0];
  if (created) {
    await replaceTechnologies(db, created.id, data.technologies);
    await replaceFeatures(db, created.id, data.features);
    await replaceFaqs(db, created.id, data.faqs);
    await replaceGallery(db, created.id, data.gallery);
  }
  return created;
}

export async function updateApp(id: string, data: AppWriteData) {
  const db = getDb();
  const rows = await db
    .select({ releasedAt: apps.releasedAt, retiredAt: apps.retiredAt })
    .from(apps)
    .where(eq(apps.id, id))
    .limit(1);
  const existing = rows[0];
  if (!existing) return null;

  const slug = await ensureUniqueSlug(db, data.slug || data.name, id);
  await db
    .update(apps)
    .set({ ...coreValues(data, existing), slug })
    .where(eq(apps.id, id));
  await replaceTechnologies(db, id, data.technologies);
  await replaceFeatures(db, id, data.features);
  await replaceFaqs(db, id, data.faqs);
  await replaceGallery(db, id, data.gallery);
  return { id, slug };
}

/** Catatan, fitur, FAQ, dan galeri ikut terhapus (cascade); artikel terkait dilepas. */
export async function deleteApp(id: string) {
  const db = getDb();
  const rows = await db.delete(apps).where(eq(apps.id, id)).returning({ slug: apps.slug });
  return rows[0] ?? null;
}

export async function listAppsAdmin(
  params: { page?: number; limit?: number; q?: string; status?: AppStatus } = {},
) {
  const db = getDb();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 50));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.q) conditions.push(like(apps.name, `%${params.q}%`));
  if (params.status) conditions.push(eq(apps.status, params.status));
  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: apps.id,
      name: apps.name,
      slug: apps.slug,
      status: apps.status,
      isPublished: apps.isPublished,
      updatedAt: apps.updatedAt,
      lastNoteAt,
      lastArticleAt,
    })
    .from(apps)
    .where(where)
    .orderBy(desc(apps.updatedAt))
    .limit(limit)
    .offset(offset);

  const totalRows = await db.select({ value: count() }).from(apps).where(where);
  return { rows: rows.map(withLastActivity), total: totalRows[0]?.value ?? 0 };
}

export async function getAppForEdit(id: string) {
  const db = getDb();
  const rows = await db.select().from(apps).where(eq(apps.id, id)).limit(1);
  const app = rows[0];
  if (!app) return null;

  const [techRows, featureRows, faqRows, gallery, cover] = await Promise.all([
    db
      .select({ name: technologies.name })
      .from(appTechnologies)
      .innerJoin(technologies, eq(appTechnologies.technologyId, technologies.id))
      .where(eq(appTechnologies.appId, id)),
    db
      .select({ title: appFeatures.title, description: appFeatures.description })
      .from(appFeatures)
      .where(eq(appFeatures.appId, id))
      .orderBy(asc(appFeatures.order)),
    db
      .select({ question: appFaqs.question, answer: appFaqs.answer })
      .from(appFaqs)
      .where(eq(appFaqs.appId, id))
      .orderBy(asc(appFaqs.order)),
    db
      .select({ id: media.id, url: media.url, filename: media.filename, kind: media.kind })
      .from(appMedia)
      .innerJoin(media, eq(appMedia.mediaId, media.id))
      .where(eq(appMedia.appId, id))
      .orderBy(asc(appMedia.order)),
    getMediaPick(db, app.coverMediaId),
  ]);

  return {
    ...app,
    technologies: techRows.map((t) => t.name),
    features: featureRows.map((f) => ({ title: f.title, description: f.description ?? "" })),
    faqs: faqRows,
    cover,
    gallery,
  };
}

/** Pilihan aplikasi untuk form lain (artikel terkait, tulis catatan cepat). */
export async function listAppsForSelect() {
  const db = getDb();
  return db.select({ id: apps.id, name: apps.name }).from(apps).orderBy(asc(apps.name));
}

/** Aplikasi berstatus Sedang dibangun yang tidak punya catatan lebih dari `days` hari. */
export async function listAppsNeedingUpdate(days = 30) {
  const db = getDb();
  const rows = await db
    .select({
      id: apps.id,
      name: apps.name,
      createdAt: apps.createdAt,
      lastNoteAt,
      lastArticleAt,
    })
    .from(apps)
    .where(eq(apps.status, "building"));

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return rows
    .map(withLastActivity)
    .filter((row) => (row.lastActivityAt ?? row.createdAt).getTime() < cutoff);
}

/* --------------------------------- Notes --------------------------------- */

export async function listAppNotes(appId: string) {
  const db = getDb();
  return db
    .select({
      id: appNotes.id,
      body: appNotes.body,
      version: appNotes.version,
      notedAt: appNotes.notedAt,
    })
    .from(appNotes)
    .where(eq(appNotes.appId, appId))
    .orderBy(desc(appNotes.notedAt), desc(appNotes.createdAt));
}

export async function createAppNote(appId: string, data: AppNoteWriteData) {
  const db = getDb();
  const slug = await getAppSlug(db, appId);
  if (!slug) return null;

  const inserted = await db
    .insert(appNotes)
    .values({
      appId,
      body: data.body.trim(),
      version: data.version?.trim() || null,
      notedAt: toDay(data.notedAt) ?? new Date(),
    })
    .returning({ id: appNotes.id });
  const note = inserted[0];
  return note ? { id: note.id, appSlug: slug } : null;
}

/** Tanggal kosong saat menyunting berarti tanggal lama dipertahankan. */
export async function updateAppNote(noteId: string, data: AppNoteWriteData) {
  const db = getDb();
  const rows = await db
    .update(appNotes)
    .set({
      body: data.body.trim(),
      version: data.version?.trim() || null,
      notedAt: toDay(data.notedAt) ?? undefined,
    })
    .where(eq(appNotes.id, noteId))
    .returning({ appId: appNotes.appId });
  const note = rows[0];
  if (!note) return null;
  return { id: noteId, appSlug: await getAppSlug(db, note.appId) };
}

export async function deleteAppNote(noteId: string) {
  const db = getDb();
  const rows = await db
    .delete(appNotes)
    .where(eq(appNotes.id, noteId))
    .returning({ appId: appNotes.appId });
  const note = rows[0];
  if (!note) return null;
  return { appId: note.appId, appSlug: await getAppSlug(db, note.appId) };
}

/* -------------------------------- Public --------------------------------- */

/** Daftar arsip di beranda: aktivitas terbaru di atas, aplikasi pensiun selalu di bawah. */
export async function listPublishedApps() {
  const db = getDb();
  const rows = await db
    .select({
      name: apps.name,
      slug: apps.slug,
      tagline: apps.tagline,
      status: apps.status,
      createdAt: apps.createdAt,
      lastNoteAt,
      lastArticleAt,
    })
    .from(apps)
    .where(eq(apps.isPublished, true));

  return rows.map(withLastActivity).sort((a, b) => {
    const retired = Number(a.status === "retired") - Number(b.status === "retired");
    if (retired !== 0) return retired;
    return (b.lastActivityAt ?? b.createdAt).getTime() - (a.lastActivityAt ?? a.createdAt).getTime();
  });
}

export type AppTimelineEntry =
  | { kind: "note"; id: string; body: string; version: string | null; date: Date }
  | { kind: "article"; title: string; slug: string; summary: string | null; date: Date };

export async function getPublishedAppBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: apps.id,
      name: apps.name,
      slug: apps.slug,
      tagline: apps.tagline,
      descriptionHtml: apps.descriptionHtml,
      status: apps.status,
      appUrl: apps.appUrl,
      repoUrl: apps.repoUrl,
      videoUrl: apps.videoUrl,
      startedAt: apps.startedAt,
      releasedAt: apps.releasedAt,
      retiredAt: apps.retiredAt,
      guideHtml: apps.guideHtml,
      showGuide: apps.showGuide,
      showFaq: apps.showFaq,
      showNotes: apps.showNotes,
      showReleases: apps.showReleases,
      createdAt: apps.createdAt,
      coverUrl: media.url,
      coverAlt: media.alt,
      lastNoteAt,
      lastArticleAt,
    })
    .from(apps)
    .leftJoin(media, eq(apps.coverMediaId, media.id))
    .where(and(eq(apps.slug, slug), eq(apps.isPublished, true)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  const app = withLastActivity(row);

  const [techRows, features, gallery, faqs, notes, linkedArticles] = await Promise.all([
    db
      .select({ name: technologies.name })
      .from(appTechnologies)
      .innerJoin(technologies, eq(appTechnologies.technologyId, technologies.id))
      .where(eq(appTechnologies.appId, app.id))
      .orderBy(asc(technologies.name)),
    db
      .select({ title: appFeatures.title, description: appFeatures.description })
      .from(appFeatures)
      .where(eq(appFeatures.appId, app.id))
      .orderBy(asc(appFeatures.order)),
    db
      .select({
        url: media.url,
        filename: media.filename,
        alt: media.alt,
        caption: appMedia.caption,
      })
      .from(appMedia)
      .innerJoin(media, eq(appMedia.mediaId, media.id))
      .where(eq(appMedia.appId, app.id))
      .orderBy(asc(appMedia.order)),
    app.showFaq
      ? db
          .select({ question: appFaqs.question, answer: appFaqs.answer })
          .from(appFaqs)
          .where(eq(appFaqs.appId, app.id))
          .orderBy(asc(appFaqs.order))
      : Promise.resolve([]),
    app.showNotes || app.showReleases
      ? db
          .select({
            id: appNotes.id,
            body: appNotes.body,
            version: appNotes.version,
            notedAt: appNotes.notedAt,
          })
          .from(appNotes)
          .where(eq(appNotes.appId, app.id))
          .orderBy(desc(appNotes.notedAt), desc(appNotes.createdAt))
      : Promise.resolve([]),
    app.showNotes
      ? db
          .select({
            title: articles.title,
            slug: articles.slug,
            summary: articles.summary,
            publishedAt: articles.publishedAt,
          })
          .from(articles)
          .where(and(eq(articles.appId, app.id), eq(articles.status, "published")))
      : Promise.resolve([]),
  ]);

  /* Catatan bernomor versi masuk ke Catatan rilis bila bagian itu dinyalakan.
     Bila tidak, catatan tersebut tetap tampil di Catatan pembuatan supaya
     tidak hilang dari halaman. */
  const releases = app.showReleases ? notes.filter((note) => note.version) : [];
  const timeline: AppTimelineEntry[] = app.showNotes
    ? [
        ...notes
          .filter((note) => !(app.showReleases && note.version))
          .map((note) => ({
            kind: "note" as const,
            id: note.id,
            body: note.body,
            version: note.version,
            date: note.notedAt,
          })),
        ...linkedArticles.flatMap((article) =>
          article.publishedAt
            ? [
                {
                  kind: "article" as const,
                  title: article.title,
                  slug: article.slug,
                  summary: article.summary,
                  date: article.publishedAt,
                },
              ]
            : [],
        ),
      ].sort((a, b) => b.date.getTime() - a.date.getTime())
    : [];

  return {
    ...app,
    technologies: techRows.map((t) => t.name),
    features,
    gallery,
    faqs,
    timeline,
    releases,
  };
}

export async function getAllPublishedAppSlugs() {
  const db = getDb();
  const rows = await db.select({ slug: apps.slug }).from(apps).where(eq(apps.isPublished, true));
  return rows.map((r) => r.slug);
}
