import { z } from "zod";
import { getYoutubeId } from "@/lib/youtube";

export const APP_STATUSES = ["building", "released", "retired"] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

/** Tautan opsional. Bila diisi wajib http(s) karena dipakai langsung sebagai href. */
const optionalHttpUrl = z
  .string()
  .trim()
  .max(300)
  .optional()
  .refine((value) => !value || /^https?:\/\//i.test(value), "Tautan harus diawali https://");

const optionalYoutubeUrl = z
  .string()
  .trim()
  .max(300)
  .optional()
  .refine((value) => !value || getYoutubeId(value) !== null, "Hanya tautan video YouTube");

/** Tanggal dari <input type="date"> (YYYY-MM-DD). Kosong = tidak diisi. */
const optionalDay = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "Tanggal tidak valid");

export const appFeatureSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(500).optional(),
});

export const appFaqSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(3000),
});

/** Input form aplikasi (create & update). descriptionJson & guideJson = dokumen Tiptap. */
export const appInputSchema = z
  .object({
    name: z.string().trim().min(1, "Nama wajib diisi").max(120),
    slug: z.string().trim().max(80).optional(),
    tagline: z.string().trim().max(200).optional(),
    descriptionJson: z.any(),
    status: z.enum(APP_STATUSES).default("building"),
    isPublished: z.boolean().default(false),
    appUrl: optionalHttpUrl,
    repoUrl: optionalHttpUrl,
    videoUrl: optionalYoutubeUrl,
    coverMediaId: z.string().trim().optional(),
    logoMediaId: z.string().trim().optional(),
    galleryMediaIds: z.array(z.string()).max(30).default([]),
    startedAt: optionalDay,
    releasedAt: optionalDay,
    retiredAt: optionalDay,
    technologies: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
    features: z.array(appFeatureSchema).max(30).default([]),
    guideJson: z.any(),
    faqs: z.array(appFaqSchema).max(50).default([]),
    showGuide: z.boolean().default(false),
    showFaq: z.boolean().default(false),
    showNotes: z.boolean().default(true),
    showReleases: z.boolean().default(false),
    metaTitle: z.string().trim().max(200).optional(),
    metaDescription: z.string().trim().max(320).optional(),
    noIndex: z.boolean().default(false),
  })
  .superRefine((val, ctx) => {
    // Baris di daftar arsip hanya berisi nama dan satu kalimat. Tanpa kalimat
    // itu, barisnya tidak menjelaskan aplikasi apa pun.
    if (val.isPublished && !val.tagline) {
      ctx.addIssue({
        code: "custom",
        path: ["tagline"],
        message: "Isi satu kalimat ringkasan sebelum aplikasi ditayangkan",
      });
    }
  });

export type AppInput = z.infer<typeof appInputSchema>;

/** Catatan pendek. Tanggal kosong = sekarang; versi terisi = catatan rilis. */
export const appNoteInputSchema = z.object({
  body: z.string().trim().min(1, "Catatan tidak boleh kosong").max(2000),
  version: z.string().trim().max(40).optional(),
  notedAt: optionalDay,
});

export type AppNoteInput = z.infer<typeof appNoteInputSchema>;
