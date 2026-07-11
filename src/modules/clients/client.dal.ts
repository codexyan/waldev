import { and, asc, eq } from "drizzle-orm";
import { slugify } from "@/lib/slug";
import { getDb, type DB } from "@/server/db/client";
import { clients, media } from "@/server/db/schema";

export interface ClientWriteData {
  name: string;
  slug?: string;
  logoMediaId?: string;
  categoryId?: string;
  websiteUrl?: string;
  isNda: boolean;
  order: number;
}

async function ensureUniqueSlug(db: DB, base: string, excludeId?: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let n = 1;
  for (;;) {
    const existing = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.slug, candidate))
      .limit(1);
    const row = existing[0];
    if (!row || row.id === excludeId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

function coreValues(data: ClientWriteData) {
  return {
    name: data.name,
    logoMediaId: data.logoMediaId || null,
    categoryId: data.categoryId || null,
    websiteUrl: data.websiteUrl?.trim() || null,
    isNda: data.isNda,
    order: data.order,
  };
}

export async function createClient(data: ClientWriteData) {
  const db = getDb();
  const slug = await ensureUniqueSlug(db, data.slug || data.name);
  await db.insert(clients).values({ ...coreValues(data), slug });
}

export async function updateClient(id: string, data: ClientWriteData) {
  const db = getDb();
  const slug = await ensureUniqueSlug(db, data.slug || data.name, id);
  await db.update(clients).set({ ...coreValues(data), slug }).where(eq(clients.id, id));
}

export async function deleteClient(id: string) {
  const db = getDb();
  await db.delete(clients).where(eq(clients.id, id));
}

export async function listClientsForManage() {
  const db = getDb();
  const rows = await db
    .select({
      id: clients.id,
      name: clients.name,
      slug: clients.slug,
      isNda: clients.isNda,
      websiteUrl: clients.websiteUrl,
      categoryId: clients.categoryId,
      order: clients.order,
      logoId: media.id,
      logoUrl: media.url,
      logoFilename: media.filename,
      logoKind: media.kind,
    })
    .from(clients)
    .leftJoin(media, eq(clients.logoMediaId, media.id))
    .orderBy(asc(clients.order), asc(clients.name));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    isNda: r.isNda,
    websiteUrl: r.websiteUrl ?? "",
    categoryId: r.categoryId ?? "",
    order: r.order,
    logo:
      r.logoId && r.logoUrl
        ? {
            id: r.logoId,
            url: r.logoUrl,
            filename: r.logoFilename ?? "",
            kind: r.logoKind ?? "image",
          }
        : null,
  }));
}

export async function listPublishedClients() {
  const db = getDb();
  return db
    .select({
      name: clients.name,
      websiteUrl: clients.websiteUrl,
      logoUrl: media.url,
    })
    .from(clients)
    .leftJoin(media, eq(clients.logoMediaId, media.id))
    .where(eq(clients.isNda, false))
    .orderBy(asc(clients.order), asc(clients.name));
}
