import { z } from "zod";

export const CATEGORY_TYPES = ["article", "portfolio", "client"] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  slug: z.string().trim().max(80).optional(),
  type: z.enum(CATEGORY_TYPES),
  description: z.string().trim().max(300).optional(),
});

export const tagInputSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(50),
  slug: z.string().trim().max(80).optional(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type TagInput = z.infer<typeof tagInputSchema>;
