import { z } from "zod";

export const SERVICE_STATUSES = ["active", "inactive"] as const;
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export const serviceFeatureSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(500).optional(),
});

export const serviceWorkflowSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(500).optional(),
});

export const serviceFaqSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(1000),
});

export const serviceInputSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(200),
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().max(5000).optional(),
  price: z.string().trim().max(100).optional(),
  ctaLabel: z.string().trim().max(80).optional(),
  ctaUrl: z.string().trim().max(300).optional(),
  status: z.enum(SERVICE_STATUSES).default("active"),
  order: z.coerce.number().int().min(0).default(0),
  features: z.array(serviceFeatureSchema).max(30).default([]),
  workflow: z.array(serviceWorkflowSchema).max(30).default([]),
  faqs: z.array(serviceFaqSchema).max(30).default([]),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;
