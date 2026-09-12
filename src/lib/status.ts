/**
 * Terjemahan status yang dipakai di panel admin dan situs publik.
 * Nilai mentahnya tetap bahasa Inggris di basis data; hanya tampilannya
 * yang diterjemahkan.
 */
const LABELS: Record<string, string> = {
  // Tulisan
  draft: "Draf",
  scheduled: "Terjadwal",
  published: "Tayang",
  // Aplikasi
  building: "Sedang dibangun",
  released: "Sudah rilis",
  retired: "Tidak aktif",
};

export function statusLabel(value: string): string {
  return LABELS[value] ?? value;
}

export type StatusTone = "default" | "secondary" | "outline" | "signal" | "success" | "warning";

/** Nada warna lencana per status, agar keadaan terbaca sekilas. */
export function statusTone(value: string): StatusTone {
  switch (value) {
    case "published":
    case "released":
      return "success";
    case "scheduled":
    case "building":
      return "warning";
    default:
      return "secondary";
  }
}
