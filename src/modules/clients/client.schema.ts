import { z } from "zod";

export const clientInputSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(150),
  slug: z.string().trim().max(80).optional(),
  logoMediaId: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  websiteUrl: z.string().trim().max(300).optional(),
  isNda: z.boolean().default(false),
  order: z.coerce.number().int().min(0).default(0),
});

export type ClientInput = z.infer<typeof clientInputSchema>;
