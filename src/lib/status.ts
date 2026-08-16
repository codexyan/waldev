/**
 * Terjemahan status yang dipakai di seluruh panel admin.
 * Nilai mentahnya tetap bahasa Inggris di basis data; hanya tampilannya
 * yang diterjemahkan supaya panel konsisten dengan situs publiknya.
 */
const LABELS: Record<string, string> = {
  // Tulisan
  draft: "Draf",
  scheduled: "Terjadwal",
  published: "Tayang",
  // Karya
  ongoing: "Berjalan",
  completed: "Selesai",
  archived: "Arsip",
  // Layanan
  active: "Aktif",
  inactive: "Nonaktif",
  // Pesan masuk
  new: "Baru",
  read: "Dibaca",
  replied: "Dibalas",
  // Prospek
  contacted: "Dihubungi",
  negotiation: "Negosiasi",
  proposal_sent: "Penawaran terkirim",
  deal: "Deal",
  closed: "Ditutup",
};

export function statusLabel(value: string): string {
  return LABELS[value] ?? value;
}

export type StatusTone = "default" | "secondary" | "outline" | "signal" | "success" | "warning";

/** Nada warna lencana per status, agar keadaan terbaca sekilas. */
export function statusTone(value: string): StatusTone {
  switch (value) {
    case "published":
    case "completed":
    case "active":
    case "deal":
    case "replied":
      return "success";
    case "scheduled":
    case "ongoing":
    case "negotiation":
    case "proposal_sent":
    case "contacted":
      return "warning";
    case "new":
      return "signal";
    default:
      return "secondary";
  }
}
