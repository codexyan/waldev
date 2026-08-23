/**
 * Tautan WhatsApp dari nomor yang disimpan di Site Settings.
 *
 * Nomor sengaja tidak pernah ditulis di kode: sumbernya `settings.contact_whatsapp`
 * yang default-nya kosong. Selama admin belum mengisinya, fungsi ini mengembalikan
 * null dan setiap pemanggil wajib menyediakan jalur cadangan (form atau /contact).
 */
export function waLink(nomor: string | null | undefined, pesan?: string): string | null {
  const digits = (nomor ?? "").replace(/[^0-9]/g, "");
  if (!digits) return null;
  const query = pesan ? `?text=${encodeURIComponent(pesan)}` : "";
  return `https://wa.me/${digits}${query}`;
}

/** Pesan pembuka siap kirim, supaya calon klien tidak perlu memikirkan kalimat pertama. */
export const WA_PESAN = {
  umum: "Halo WalDev, saya ingin berkonsultasi soal kebutuhan website/sistem untuk usaha saya.",
  harga: "Halo WalDev, saya ingin tahu perkiraan biaya untuk kebutuhan saya.",
  layanan: (nama: string) => `Halo WalDev, saya tertarik dengan layanan ${nama}. Boleh dijelaskan?`,
  karya: (judul: string) =>
    `Halo WalDev, saya baru membaca proyek "${judul}" dan ingin sesuatu yang serupa untuk usaha saya.`,
  artikel: (judul: string) =>
    `Halo WalDev, saya baru membaca tulisan "${judul}" dan ingin menerapkannya. Boleh berdiskusi?`,
} as const;
