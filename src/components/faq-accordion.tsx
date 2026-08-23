import { Plus } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Pertanyaan umum. Tetap lengkap karena dipakai sebagai cadangan di halaman
 * detail layanan untuk layanan yang belum punya FAQ sendiri di CMS.
 * Beranda memakai subset HOME_FAQS di bawahnya.
 */
export const GENERAL_FAQS: FaqItem[] = [
  {
    question: "Berapa lama satu proyek dikerjakan?",
    answer:
      "Halaman promosi umumnya 1 sampai 2 minggu, website perusahaan 3 sampai 5 minggu, dan sistem informasi 6 minggu ke atas. Estimasi pastinya kami berikan setelah cakupan pekerjaan disepakati bersama.",
  },
  {
    question: "Bagaimana biayanya dihitung?",
    answer:
      "Angka yang tertera pada tiap layanan adalah titik awal, bukan harga mati. Biaya akhir dihitung dari jumlah halaman atau fitur, tingkat kerumitan, dan lama pengerjaan. Setelah kebutuhan Anda masuk, kami kirimkan rincian penawaran lengkap sebelum pekerjaan dimulai, tanpa biaya tersembunyi.",
  },
  {
    /* Kekhawatiran "harus bayar lunas di depan?" adalah salah satu alasan
       paling umum orang menutup tab. Jawabannya sengaja tidak menyebut
       persentase atau jumlah termin: itu keputusan komersial pemilik, dan
       angka yang salah di sini menjadi janji kepada calon klien. Yang
       dijanjikan hanya hal yang memang selalu benar — pembayaran bertahap
       dan rinciannya tertulis lebih dulu. */
    question: "Apakah harus dibayar lunas di depan?",
    answer:
      "Tidak. Pembayaran dibagi bertahap mengikuti tahapan pekerjaan, jadi Anda tidak pernah membayar untuk sesuatu yang belum terlihat hasilnya. Besaran dan jadwal tiap tahap kami cantumkan tertulis di dalam penawaran sebelum pekerjaan dimulai, dan baru berlaku setelah Anda menyetujuinya.",
  },
  {
    question: "Bagaimana kalau saya belum punya logo, foto, atau teksnya?",
    answer:
      "Tidak masalah, banyak klien datang hanya dengan gambaran kasar. Kami bantu susun struktur halaman dan daftar materi yang dibutuhkan, lalu kita sepakati mana yang Anda siapkan dan mana yang kami kerjakan. Pembagian itu ikut tertulis di penawaran, jadi tidak ada kejutan biaya di tengah jalan.",
  },
  {
    question: "Apakah saya bisa mengelola kontennya sendiri?",
    answer:
      "Bisa. Setiap website kami lengkapi halaman pengelolaan, sehingga teks, gambar, artikel, dan portofolio dapat Anda ubah kapan saja tanpa menyentuh kode atau menghubungi kami. Kami juga memandu tim Anda memakainya saat serah terima.",
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
  {
    question: "Teknologi apa yang kalian pakai?",
    answer:
      "Next.js, React, dan TypeScript untuk aplikasinya, dengan infrastruktur Cloudflare untuk penyajian. Kombinasi ini membuat situs terbuka cepat dari mana saja dan biaya operasionalnya tetap ringan.",
  },
];

/**
 * Subset untuk beranda: hanya pertanyaan yang benar-benar menghentikan
 * keputusan, dan yang belum dijawab seksi lain. Durasi sudah ada di kartu
 * perkiraan waktu, kepemilikan hasil sudah ada di daftar jaminan, dan
 * pertanyaan teknologi adalah pertanyaan sesama pengembang.
 */
export const HOME_FAQS: FaqItem[] = GENERAL_FAQS.filter((faq) =>
  [
    "Bagaimana biayanya dihitung?",
    "Apakah harus dibayar lunas di depan?",
    "Bagaimana kalau saya belum punya logo, foto, atau teksnya?",
    "Apakah saya bisa mengelola kontennya sendiri?",
    "Ada dukungan setelah peluncuran?",
  ].includes(faq.question),
);

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-border border-t">
      {items.map((item) => (
        <details key={item.question} className="accordion group border-border border-b">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-left [&::-webkit-details-marker]:hidden">
            <span className="display-sm text-[0.9375rem]">{item.question}</span>
            <Plus
              className="text-faint h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-45"
              aria-hidden
            />
          </summary>
          <p className="text-muted-foreground max-w-2xl pr-10 pb-5 leading-relaxed text-pretty">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
