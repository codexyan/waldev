import { Plus } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

/** Pertanyaan umum yang dipakai di beranda dan halaman detail layanan. */
export const GENERAL_FAQS: FaqItem[] = [
  {
    question: "Berapa lama satu proyek dikerjakan?",
    answer:
      "Landing page umumnya 1 sampai 2 minggu, website perusahaan 3 sampai 5 minggu, dan sistem informasi 6 minggu ke atas. Estimasi pastinya kami berikan setelah cakupan pekerjaan disepakati bersama.",
  },
  {
    question: "Bagaimana biayanya dihitung?",
    answer:
      "Biaya dihitung dari cakupan fitur, tingkat kerumitan, dan durasi pengerjaan. Setelah brief Anda masuk, kami kirimkan rincian penawaran lengkap sebelum pekerjaan dimulai, tanpa biaya tersembunyi.",
  },
  {
    question: "Apakah saya bisa mengelola kontennya sendiri?",
    answer:
      "Bisa. Setiap website kami lengkapi dashboard admin, sehingga teks, gambar, artikel, dan portofolio dapat Anda ubah kapan saja tanpa menyentuh kode atau menghubungi kami.",
  },
  {
    question: "Teknologi apa yang kalian pakai?",
    answer:
      "Next.js, React, dan TypeScript untuk aplikasinya, dengan infrastruktur Cloudflare untuk penyajian. Kombinasi ini membuat situs terbuka cepat dari mana saja dan biaya operasionalnya tetap ringan.",
  },
  {
    question: "Ada dukungan setelah peluncuran?",
    answer:
      "Ada masa dukungan setelah rilis untuk perbaikan bug, dan tersedia paket perawatan bulanan bila Anda ingin pembaruan rutin, pemantauan, serta penambahan fitur berkala.",
  },
  {
    question: "Siapa pemilik hasil pekerjaannya?",
    answer:
      "Sepenuhnya milik Anda setelah pelunasan, termasuk kode sumber dan aset desain. Ketentuan ini kami tuangkan tertulis di dalam perjanjian kerja sama sejak awal.",
  },
];

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-t border-border">
      {items.map((item, index) => (
        <details
          key={item.question}
          className="accordion group border-b border-border"
          data-reveal
          style={{ transitionDelay: `${index * 50}ms` }}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
            <span className="display-sm text-lg sm:text-xl">{item.question}</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-500 group-open:rotate-45 group-open:border-transparent group-open:bg-signal group-open:text-signal-foreground">
              <Plus className="h-4 w-4" aria-hidden />
            </span>
          </summary>
          <p className="max-w-2xl pb-7 pr-14 text-pretty leading-relaxed text-muted-foreground">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
