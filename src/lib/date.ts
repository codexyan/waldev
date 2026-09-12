/**
 * Zona waktu situs. WalDev berbasis di Banjarmasin (WITA), sementara Worker
 * berjalan dalam UTC. Setiap tanggal yang ditampilkan menyebut zonanya supaya
 * server dan browser menulis hari yang sama.
 */
export const SITE_TIMEZONE = "Asia/Makassar";

/** "2026-09-12" menurut zona waktu situs, format yang dipakai <input type="date">. */
export function toDateInput(value: Date | null | undefined): string {
  if (!value) return "";
  // Locale en-CA menulis tanggal sebagai YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: SITE_TIMEZONE }).format(value);
}

/** "Sep 2026" */
export function formatMonthYear(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    year: "numeric",
    timeZone: SITE_TIMEZONE,
  }).format(value);
}

/** "12 Sep 2026" */
export function formatDay(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: SITE_TIMEZONE,
  }).format(value);
}

/**
 * Jarak waktu singkat dalam bahasa Indonesia, misalnya "3 hari lalu".
 * Hanya untuk komponen server: hasilnya bergantung pada jam saat dirender.
 */
export function timeAgo(value: Date | null): string {
  if (!value) return "belum pernah";
  const seconds = Math.max(0, Math.floor((Date.now() - value.getTime()) / 1000));
  if (seconds < 60) return "baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan lalu`;
  return `${Math.floor(months / 12)} tahun lalu`;
}
