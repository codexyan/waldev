import { z } from "zod";

export const ARTICLE_STATUSES = ["draft", "scheduled", "published"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

/** Input form artikel (create & update). contentJson = dokumen Tiptap. */
export const articleInputSchema = z
  .object({
    title: z.string().trim().min(1, "Judul wajib diisi").max(200),
    slug: z.string().trim().max(80).optional(),
    summary: z.string().trim().max(500).optional(),
    coverMediaId: z.string().trim().optional(),
    contentJson: z.any(),
    categoryId: z.string().trim().optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
    status: z.enum(ARTICLE_STATUSES).default("draft"),
    scheduledAt: z.string().trim().optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (val.status === "scheduled") {
      if (!val.scheduledAt) {
        ctx.addIssue({
          code: "custom",
          path: ["scheduledAt"],
          message: "Tanggal jadwal wajib untuk status Scheduled",
        });
      } else if (Number.isNaN(new Date(val.scheduledAt).getTime())) {
        ctx.addIssue({
          code: "custom",
          path: ["scheduledAt"],
          message: "Tanggal jadwal tidak valid",
        });
      }
    }
  });

export type ArticleInput = z.infer<typeof articleInputSchema>;
