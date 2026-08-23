export const SITE_SETTINGS_DEFAULTS = {
  brand_name: "WalDev",
  tagline: "Studio Digital Indonesia",
  description:
    "WalDev merancang dan membangun website, sistem informasi, dan dashboard internal untuk bisnis di Indonesia, dikerjakan dari Banjarmasin. Dari perencanaan sampai peluncuran, oleh satu tim yang sama.",
  contact_email: "",
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

export const SETTINGS_FIELDS: { key: SettingsKey; label: string }[] = [
  { key: "brand_name", label: "Nama Brand" },
  { key: "tagline", label: "Tagline" },
  { key: "description", label: "Deskripsi" },
  { key: "contact_email", label: "Email Kontak" },
  { key: "contact_whatsapp", label: "WhatsApp" },
  { key: "location_city", label: "Kota" },
  { key: "location_region", label: "Provinsi" },
  { key: "founded_year", label: "Tahun Berdiri" },
  { key: "social_instagram", label: "Instagram URL" },
  { key: "social_linkedin", label: "LinkedIn URL" },
  { key: "social_github", label: "GitHub URL" },
  { key: "footer_text", label: "Teks Footer" },
];
