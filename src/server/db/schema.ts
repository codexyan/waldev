import { createId } from "@paralleldrive/cuid2";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => createId());

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date());

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date());

/* ================================================================== */
/* AUTH & RBAC                                                        */
/* ================================================================== */

export const roles = sqliteTable("roles", {
  id: id(),
  name: text("name").notNull().unique(), // owner | editor
  description: text("description"),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const permissions = sqliteTable("permissions", {
  id: id(),
  key: text("key").notNull().unique(), // e.g. "article.create"
  description: text("description"),
});

export const rolePermissions = sqliteTable(
  "role_permissions",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

// Better Auth core tables (field keys mengikuti konvensi Better Auth).
export const user = sqliteTable("user", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  roleId: text("role_id").references(() => roles.id, { onDelete: "restrict" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = sqliteTable(
  "session",
  {
    id: id(),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("idx_session_user").on(t.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: id(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("idx_account_user").on(t.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: id(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("idx_verification_identifier").on(t.identifier)],
);

/* ================================================================== */
/* TAXONOMY & MEDIA                                                   */
/* ================================================================== */

export const categories = sqliteTable(
  "categories",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    type: text("type", { enum: ["article"] }).notNull(),
    description: text("description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("uq_categories_type_slug").on(t.type, t.slug)],
);

export const tags = sqliteTable("tags", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: createdAt(),
});

export const media = sqliteTable(
  "media",
  {
    id: id(),
    r2Key: text("r2_key").notNull().unique(),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    kind: text("kind", { enum: ["image", "pdf", "document"] }).notNull(),
    width: integer("width"),
    height: integer("height"),
    alt: text("alt"),
    uploadedBy: text("uploaded_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [index("idx_media_kind").on(t.kind)],
);

export const technologies = sqliteTable("technologies", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  iconMediaId: text("icon_media_id").references(() => media.id, { onDelete: "set null" }),
});

/* ================================================================== */
/* CLIENTS                                                            */
/* ================================================================== */

/**
 * Klien yang logonya tampil di beranda (docs/09 §6.5). Dipulihkan setelah Tahap 4
 * dengan definisi yang sama persis dengan 0000, supaya tabel yang masih ada di
 * produksi langsung cocok. `category_id` tidak dipakai kode lagi.
 */
export const clients = sqliteTable("clients", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoMediaId: text("logo_media_id").references(() => media.id, { onDelete: "set null" }),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  websiteUrl: text("website_url"),
  // Klien rahasia: tersimpan di panel, tidak pernah tampil di situs publik.
  isNda: integer("is_nda", { mode: "boolean" }).notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/* ================================================================== */
/* PESAN KONTAK                                                       */
/* ================================================================== */

/**
 * Pesan dari formulir di halaman Kontak (docs/09 §5.4). Definisinya sama persis dengan
 * tabel lama di `0000_calm_bastion` yang masih ada di produksi, jadi skema produksi tidak
 * perlu diubah. Baris baru ditulis `src/server/contact-endpoint.ts` di Worker, bukan lewat
 * Drizzle; `subject` tidak dipakai formulir.
 */
export const contactMessages = sqliteTable(
  "contact_messages",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject"),
    message: text("message").notNull(),
    status: text("status", { enum: ["new", "read", "archived"] })
      .notNull()
      .default("new"),
    createdAt: createdAt(),
  },
  (t) => [index("idx_contact_status").on(t.status)],
);

/* ================================================================== */
/* APPS                                                               */
/* ================================================================== */

/**
 * Arsip aplikasi (docs/09-arsip-aplikasi.md). Bagian wajib halaman aplikasi
 * tersimpan di baris ini; bagian opsional (panduan, FAQ, catatan pembuatan,
 * catatan rilis) dinyalakan per aplikasi lewat kolom show_*.
 */
export const apps = sqliteTable(
  "apps",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    tagline: text("tagline"), // satu kalimat untuk baris daftar arsip
    descriptionJson: text("description_json"), // Tiptap JSON (sumber kebenaran)
    descriptionHtml: text("description_html"), // hasil render tersanitasi (cache)
    status: text("status", { enum: ["building", "released", "retired"] })
      .notNull()
      .default("building"),
    // false = draf, atau aplikasi yang berhenti sebelum sempat rilis.
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    appUrl: text("app_url"),
    repoUrl: text("repo_url"),
    videoUrl: text("video_url"), // hanya YouTube
    coverMediaId: text("cover_media_id").references(() => media.id, { onDelete: "set null" }),
    // Logo persegi untuk kartu aplikasi di beranda dan kepala halaman aplikasi.
    logoMediaId: text("logo_media_id").references(() => media.id, { onDelete: "set null" }),
    startedAt: integer("started_at", { mode: "timestamp" }),
    releasedAt: integer("released_at", { mode: "timestamp" }),
    retiredAt: integer("retired_at", { mode: "timestamp" }),
    guideJson: text("guide_json"),
    guideHtml: text("guide_html"),
    showGuide: integer("show_guide", { mode: "boolean" }).notNull().default(false),
    showFaq: integer("show_faq", { mode: "boolean" }).notNull().default(false),
    showNotes: integer("show_notes", { mode: "boolean" }).notNull().default(true),
    showReleases: integer("show_releases", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("idx_apps_status").on(t.status), index("idx_apps_published").on(t.isPublished)],
);

export const appMedia = sqliteTable(
  "app_media",
  {
    id: id(),
    appId: text("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    mediaId: text("media_id")
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    caption: text("caption"),
    order: integer("order").notNull().default(0),
  },
  (t) => [index("idx_app_media_app").on(t.appId)],
);

export const appFeatures = sqliteTable(
  "app_features",
  {
    id: id(),
    appId: text("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    order: integer("order").notNull().default(0),
  },
  (t) => [index("idx_app_features_app").on(t.appId)],
);

export const appTechnologies = sqliteTable(
  "app_technologies",
  {
    appId: text("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    technologyId: text("technology_id")
      .notNull()
      .references(() => technologies.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.appId, t.technologyId] })],
);

export const appFaqs = sqliteTable(
  "app_faqs",
  {
    id: id(),
    appId: text("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    order: integer("order").notNull().default(0),
  },
  (t) => [index("idx_app_faqs_app").on(t.appId)],
);

/** Catatan pendek per aplikasi. `version` terisi = catatan rilis. Tanpa draf. */
export const appNotes = sqliteTable(
  "app_notes",
  {
    id: id(),
    appId: text("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    version: text("version"),
    // Terpisah dari created_at supaya catatan aplikasi lama bisa diberi tanggal mundur.
    notedAt: integer("noted_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("idx_app_notes_app_noted").on(t.appId, t.notedAt)],
);

/* ================================================================== */
/* ARTICLES                                                           */
/* ================================================================== */

export const articles = sqliteTable(
  "articles",
  {
    id: id(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    summary: text("summary"),
    coverMediaId: text("cover_media_id").references(() => media.id, { onDelete: "set null" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    // Aplikasi yang dibahas artikel ini; artikelnya tampil di Catatan pembuatan aplikasi itu.
    appId: text("app_id").references(() => apps.id, { onDelete: "set null" }),
    contentJson: text("content_json"), // Tiptap JSON (sumber kebenaran)
    contentHtml: text("content_html"), // hasil render tersanitasi (cache)
    readingTime: integer("reading_time").notNull().default(0),
    status: text("status", { enum: ["draft", "scheduled", "published"] })
      .notNull()
      .default("draft"),
    scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("idx_articles_status").on(t.status),
    index("idx_articles_published_at").on(t.publishedAt),
    index("idx_articles_category").on(t.categoryId),
    index("idx_articles_app").on(t.appId),
  ],
);

export const articleTags = sqliteTable(
  "article_tags",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.articleId, t.tagId] })],
);

export const articleRelated = sqliteTable(
  "article_related",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    relatedArticleId: text("related_article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.articleId, t.relatedArticleId] })],
);

/* ================================================================== */
/* SITE: NAVIGATION, SETTINGS, SEO, AUDIT                             */
/* ================================================================== */

export const navigationMenus = sqliteTable("navigation_menus", {
  id: id(),
  key: text("key").notNull().unique(), // header | footer
  name: text("name").notNull(),
});

export const navigationItems = sqliteTable(
  "navigation_items",
  {
    id: id(),
    menuId: text("menu_id")
      .notNull()
      .references(() => navigationMenus.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url").notNull(),
    parentId: text("parent_id"),
    target: text("target"),
    order: integer("order").notNull().default(0),
  },
  (t) => [index("idx_nav_items_menu").on(t.menuId)],
);

export const settings = sqliteTable("settings", {
  id: id(),
  key: text("key").notNull().unique(),
  value: text("value"), // string / JSON
  group: text("group"),
});

export const seoMeta = sqliteTable(
  "seo_meta",
  {
    id: id(),
    entityType: text("entity_type").notNull(), // article | app | page
    entityId: text("entity_id"), // null untuk halaman statis (pakai entityType sbg key)
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    ogImageMediaId: text("og_image_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    canonicalUrl: text("canonical_url"),
    keywords: text("keywords"),
    jsonLd: text("json_ld"),
    noIndex: integer("no_index", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [uniqueIndex("uq_seo_entity").on(t.entityType, t.entityId)],
);

export const activityLogs = sqliteTable(
  "activity_logs",
  {
    id: id(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    metadata: text("metadata"), // JSON
    ipAddress: text("ip_address"),
    createdAt: createdAt(),
  },
  (t) => [
    index("idx_activity_user").on(t.userId),
    index("idx_activity_entity").on(t.entityType),
    index("idx_activity_created").on(t.createdAt),
  ],
);
