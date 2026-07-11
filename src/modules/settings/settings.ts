export const SITE_SETTINGS_DEFAULTS = {
  brand_name: "WalDev",
  tagline: "Build Digital Products.",
  description:
    "WalDev adalah studio digital yang membangun website, sistem informasi, web application, dan produk digital yang modern, cepat, dan profesional.",
  contact_email: "",
  contact_whatsapp: "",
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
  { key: "social_instagram", label: "Instagram URL" },
  { key: "social_linkedin", label: "LinkedIn URL" },
  { key: "social_github", label: "GitHub URL" },
  { key: "footer_text", label: "Teks Footer" },
];
