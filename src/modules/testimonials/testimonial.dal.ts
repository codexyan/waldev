import { asc, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { media, testimonials } from "@/server/db/schema";
import type { TestimonialStatus } from "./testimonial.schema";

export interface TestimonialWriteData {
  authorName: string;
  authorRole?: string;
  company?: string;
  photoMediaId?: string;
  content: string;
  rating?: number;
  status: TestimonialStatus;
  clientId?: string;
  order: number;
}

function coreValues(data: TestimonialWriteData) {
  return {
    authorName: data.authorName,
    authorRole: data.authorRole?.trim() || null,
    company: data.company?.trim() || null,
    photoMediaId: data.photoMediaId || null,
    content: data.content,
    rating: data.rating ?? null,
    status: data.status,
    clientId: data.clientId || null,
    order: data.order,
  };
}

export async function createTestimonial(data: TestimonialWriteData) {
  const db = getDb();
  await db.insert(testimonials).values(coreValues(data));
}

export async function updateTestimonial(id: string, data: TestimonialWriteData) {
  const db = getDb();
  await db.update(testimonials).set(coreValues(data)).where(eq(testimonials.id, id));
}

export async function deleteTestimonial(id: string) {
  const db = getDb();
  await db.delete(testimonials).where(eq(testimonials.id, id));
}

export async function listTestimonialsForManage() {
  const db = getDb();
  const rows = await db
    .select({
      id: testimonials.id,
      authorName: testimonials.authorName,
      authorRole: testimonials.authorRole,
      company: testimonials.company,
      content: testimonials.content,
      rating: testimonials.rating,
      status: testimonials.status,
      clientId: testimonials.clientId,
      order: testimonials.order,
      photoId: media.id,
      photoUrl: media.url,
      photoFilename: media.filename,
      photoKind: media.kind,
    })
    .from(testimonials)
    .leftJoin(media, eq(testimonials.photoMediaId, media.id))
    .orderBy(asc(testimonials.order));

  return rows.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    authorRole: r.authorRole ?? "",
    company: r.company ?? "",
    content: r.content,
    rating: r.rating,
    status: r.status,
    clientId: r.clientId ?? "",
    order: r.order,
    photo:
      r.photoId && r.photoUrl
        ? {
            id: r.photoId,
            url: r.photoUrl,
            filename: r.photoFilename ?? "",
            kind: r.photoKind ?? "image",
          }
        : null,
  }));
}

export async function listPublishedTestimonials() {
  const db = getDb();
  return db
    .select({
      authorName: testimonials.authorName,
      authorRole: testimonials.authorRole,
      company: testimonials.company,
      content: testimonials.content,
      rating: testimonials.rating,
      photoUrl: media.url,
    })
    .from(testimonials)
    .leftJoin(media, eq(testimonials.photoMediaId, media.id))
    .where(eq(testimonials.status, "published"))
    .orderBy(asc(testimonials.order));
}
