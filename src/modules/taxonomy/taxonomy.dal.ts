import { and, asc, eq } from "drizzle-orm";
import { slugify } from "@/lib/slug";
import { getDb } from "@/server/db/client";
import { categories, tags } from "@/server/db/schema";
import type { CategoryType } from "./taxonomy.schema";

/* Categories */

export async function listCategories(type?: CategoryType) {
  const db = getDb();
  const where = type ? eq(categories.type, type) : undefined;
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      type: categories.type,
      description: categories.description,
    })
    .from(categories)
    .where(where)
    .orderBy(asc(categories.type), asc(categories.name));
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  type: CategoryType;
  description?: string;
}) {
  const db = getDb();
  const slug = slugify(input.slug || input.name);
  await db
    .insert(categories)
    .values({
      name: input.name,
      slug,
      type: input.type,
      description: input.description?.trim() || null,
    })
    .onConflictDoNothing();
}

export async function updateCategory(
  id: string,
  input: { name: string; slug?: string; type: CategoryType; description?: string },
) {
  const db = getDb();
  await db
    .update(categories)
    .set({
      name: input.name,
      slug: slugify(input.slug || input.name),
      type: input.type,
      description: input.description?.trim() || null,
    })
    .where(eq(categories.id, id));
}

export async function deleteCategory(id: string) {
  const db = getDb();
  await db.delete(categories).where(eq(categories.id, id));
}

export async function getCategory(id: string) {
  const db = getDb();
  const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return rows[0] ?? null;
}

/* Tags */

export async function listTags() {
  const db = getDb();
  return db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(tags)
    .orderBy(asc(tags.name));
}

export async function createTag(input: { name: string; slug?: string }) {
  const db = getDb();
  await db
    .insert(tags)
    .values({ name: input.name, slug: slugify(input.slug || input.name) })
    .onConflictDoNothing();
}

export async function deleteTag(id: string) {
  const db = getDb();
  await db.delete(tags).where(eq(tags.id, id));
}

/** Cek apakah kategori tipe tertentu sudah ada (dipakai untuk validasi ringan). */
export async function categoryExists(type: CategoryType, slug: string) {
  const db = getDb();
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.type, type), eq(categories.slug, slug)))
    .limit(1);
  return rows.length > 0;
}
