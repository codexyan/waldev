import { SITE } from "@/lib/constants";

export const SITE_SETTINGS_DEFAULTS = {
  brand_name: SITE.name,
  tagline: SITE.tagline,
  description: SITE.description,
  /* Satu kalimat di atas daftar arsip beranda (docs/09 §5.1). */
  home_intro: "",
  /* Profil pembuat untuk halaman Tentang (docs/09 §5.3). Foto disimpan sebagai id media. */
  owner_name: "",
  owner_photo_media_id: "",
  owner_bio: "",
  contact_email: "",
  /* Tidak lagi diisi dari panel. Masih dibaca tombol WhatsApp situs lama sampai
     modul jasa dihapus di Tahap 4. */
  contact_whatsapp: "",
  /* Identitas tempat & usia studio. Nilai default diisi karena ini fakta brand
     yang stabil — sama seperti brand_name dan tagline di atas — dan tetap bisa
     ditimpa lewat panel bila studio pindah atau ingin menuliskannya lain. */
  location_city: "Banjarmasin",
  location_region: "Kalimantan Selatan",
  founded_year: "2023",
  social_instagram: "",
  social_linkedin: "",
  social_github: "",
  footer_text: "",
} as const;

export type SettingsKey = keyof typeof SITE_SETTINGS_DEFAULTS;
export type SiteSettings = Record<SettingsKey, string>;

export interface SettingsField {
  key: SettingsKey;
  label: string;
  hint?: string;
  multiline?: boolean;
  /** Isian berupa pilihan media; nilainya id media. */
  media?: boolean;
}

export interface SettingsGroup {
  title: string;
  description?: string;
  fields: SettingsField[];
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: "Identitas situs",
    fields: [
      { key: "brand_name", label: "Nama brand" },
      { key: "tagline", label: "Tagline" },
      { key: "description", label: "Deskripsi", multiline: true },
      {
        key: "home_intro",
        label: "Kalimat pengantar beranda",
        hint: "Satu kalimat di atas daftar arsip, misalnya “Arsip aplikasi yang dibangun dan dirawat WalDev.”",
      },
      { key: "footer_text", label: "Teks footer", multiline: true },
    ],
  },
  {
    title: "Profil pembuat",
    description: "Tampil di halaman Tentang.",
    fields: [
      { key: "owner_name", label: "Nama" },
      { key: "owner_photo_media_id", label: "Foto", media: true },
      { key: "owner_bio", label: "Cerita singkat", multiline: true },
    ],
  },
  {
    title: "Kontak & sosial",
    description: "Email dan tautan sosial adalah satu-satunya jalur kontak di situs.",
    fields: [
      { key: "contact_email", label: "Email kontak" },
      { key: "social_github", label: "GitHub URL" },
      { key: "social_linkedin", label: "LinkedIn URL" },
      { key: "social_instagram", label: "Instagram URL" },
    ],
  },
  {
    title: "Lokasi",
    fields: [
      { key: "location_city", label: "Kota" },
      { key: "location_region", label: "Provinsi" },
      { key: "founded_year", label: "Tahun berdiri" },
    ],
  },
];
