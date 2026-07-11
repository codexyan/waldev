import { z } from "zod";

export const PORTFOLIO_STATUSES = ["ongoing", "completed", "archived"] as const;
export type PortfolioStatus = (typeof PORTFOLIO_STATUSES)[number];

export const portfolioFeatureSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(500).optional(),
});

export const portfolioInputSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  slug: z.string().trim().max(80).optional(),
  summary: z.string().trim().max(500).optional(),
  challenge: z.string().trim().max(5000).optional(),
  solution: z.string().trim().max(5000).optional(),
  timeline: z.string().trim().max(100).optional(),
  status: z.enum(PORTFOLIO_STATUSES).default("completed"),
  demoUrl: z.string().trim().max(300).optional(),
  repoUrl: z.string().trim().max(300).optional(),
  thumbnailMediaId: z.string().trim().optional(),
  coverMediaId: z.string().trim().optional(),
  galleryMediaIds: z.array(z.string()).max(30).default([]),
  clientId: z.string().trim().optional(),
  isConfidential: z.boolean().default(false),
  order: z.coerce.number().int().min(0).default(0),
  technologies: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  features: z.array(portfolioFeatureSchema).max(30).default([]),
});

export type PortfolioInput = z.infer<typeof portfolioInputSchema>;
