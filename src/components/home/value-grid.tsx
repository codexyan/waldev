import { FileSignature, Gauge, KeyRound, Users, type LucideIcon } from "lucide-react";

/**
 * Empat jaminan yang menurunkan risiko membeli.
 *
 * Sengaja tidak tumpang tindih dengan FAQ beranda: pertanyaan yang sudah
 * dijawab di sini (kepemilikan hasil, kepastian biaya) dikeluarkan dari
 * daftar FAQ, supaya pengunjung tidak membaca hal yang sama dua kali.
 */
const JAMINAN: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Users,
    title: "Satu tim dari awal sampai akhir",
    body: "Perencanaan, desain, dan pembuatan dikerjakan orang yang sama. Anda tidak perlu jadi penerjemah antar vendor.",
  },
  {
    icon: FileSignature,
    title: "Biaya disepakati di depan",
    body: "Cakupan dan harga tertulis sebelum pekerjaan dimulai. Tidak ada tagihan tambahan yang muncul di tengah jalan.",
  },
  {
    icon: Gauge,
    title: "Cepat dibuka, juga di sinyal pas-pasan",
    body: "Halaman disajikan dari server terdekat dengan pengunjung, dan kami uji di jaringan seluler, bukan hanya wifi kantor.",
  },
  {
    icon: KeyRound,
    title: "Hasilnya milik Anda",
    body: "Kode, berkas desain, dan seluruh akunnya diserahkan setelah pelunasan. Anda bebas melanjutkan dengan siapa pun.",
  },
];

/**
 * Empat blok teks tanpa kotak, tanpa garis pemisah, tanpa efek sentuh.
 * Yang memisahkan satu jaminan dari jaminan lain hanyalah jarak.
 */
export function ValueGrid() {
  return (
    <div className="grid gap-x-12 gap-y-9 sm:grid-cols-2">
      {JAMINAN.map((item) => (
        <div key={item.title}>
          <h3 className="display-sm flex items-center gap-2 text-[0.9375rem]">
            <item.icon className="text-link h-4 w-4 shrink-0" aria-hidden />
            {item.title}
          </h3>
          <p className="text-muted-foreground mt-2 leading-relaxed">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
