import { and, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { seoMeta } from "@/server/db/schema";

export interface SeoInput {
  metaTitle?: string;
  metaDescription?: string;
  noIndex?: boolean;
}

export interface SeoMetaValue {
  metaTitle: string;
  metaDescription: string;
  noIndex: boolean;
}

export async function getSeoMeta(entityType: string, entityId: string): Promise<SeoMetaValue> {
  const db = getDb();
  const rows = await db
    .select({
      metaTitle: seoMeta.metaTitle,
      metaDescription: seoMeta.metaDescription,
      noIndex: seoMeta.noIndex,
    })
    .from(seoMeta)
    .where(and(eq(seoMeta.entityType, entityType), eq(seoMeta.entityId, entityId)))
    .limit(1);
  const row = rows[0];
  return {
    metaTitle: row?.metaTitle ?? "",
    metaDescription: row?.metaDescription ?? "",
    noIndex: row?.noIndex ?? false,
  };
}

export async function upsertSeoMeta(entityType: string, entityId: string, input: SeoInput) {
  const db = getDb();
  const metaTitle = input.metaTitle?.trim() || null;
  const metaDescription = input.metaDescription?.trim() || null;
  const noIndex = input.noIndex ?? false;

  const existing = await db
    .select({ id: seoMeta.id })
    .from(seoMeta)
    .where(and(eq(seoMeta.entityType, entityType), eq(seoMeta.entityId, entityId)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(seoMeta)
      .set({ metaTitle, metaDescription, noIndex })
      .where(eq(seoMeta.id, existing[0].id));
  } else if (metaTitle || metaDescription || noIndex) {
    await db.insert(seoMeta).values({ entityType, entityId, metaTitle, metaDescription, noIndex });
  }
}
