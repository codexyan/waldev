import { z } from "zod";

export const COLLABORATION_STATUSES = [
  "new",
  "contacted",
  "negotiation",
  "proposal_sent",
  "deal",
  "completed",
  "closed",
] as const;
export type CollaborationStatus = (typeof COLLABORATION_STATUSES)[number];

export const CONTACT_STATUSES = ["new", "read", "replied"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

const emailField = z
  .string()
  .trim()
  .min(3)
  .max(200)
  .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Email tidak valid");

export const collaborationSubmitSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(120),
  email: emailField,
  whatsapp: z.string().trim().max(40).optional(),
  company: z.string().trim().max(150).optional(),
  budget: z.string().trim().max(100).optional(),
  deadline: z.string().trim().max(100).optional(),
  projectType: z.string().trim().max(100).optional(),
  description: z.string().trim().min(10, "Ceritakan kebutuhan Anda (min. 10 karakter)").max(5000),
  attachmentMediaId: z.string().trim().optional(),
  turnstileToken: z.string().optional(),
});

export const contactSubmitSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(120),
  email: emailField,
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5, "Pesan terlalu pendek").max(5000),
  turnstileToken: z.string().optional(),
});

export type CollaborationSubmit = z.infer<typeof collaborationSubmitSchema>;
export type ContactSubmit = z.infer<typeof contactSubmitSchema>;
