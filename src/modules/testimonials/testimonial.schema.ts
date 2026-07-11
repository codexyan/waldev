import { z } from "zod";

export const TESTIMONIAL_STATUSES = ["draft", "published"] as const;
export type TestimonialStatus = (typeof TESTIMONIAL_STATUSES)[number];

export const testimonialInputSchema = z.object({
  authorName: z.string().trim().min(1, "Nama wajib diisi").max(120),
  authorRole: z.string().trim().max(120).optional(),
  company: z.string().trim().max(150).optional(),
  photoMediaId: z.string().trim().optional(),
  content: z.string().trim().min(1, "Isi testimoni wajib diisi").max(2000),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  status: z.enum(TESTIMONIAL_STATUSES).default("draft"),
  clientId: z.string().trim().optional(),
  order: z.coerce.number().int().min(0).default(0),
});

export type TestimonialInput = z.infer<typeof testimonialInputSchema>;
