import { DURASI, WAKTU_BALAS } from "@/lib/constants";

/**
 * Tiga langkah memulai, ditulis dari sudut pandang klien.
 *
 * Menggantikan timeline lima tahap di beranda ("Memahami kebutuhan",
 * "Strategi dan definisi", "Desain dan prototipe", ...) yang menjelaskan
 * metodologi studio, bukan hal yang perlu dilakukan calon klien. Versi
 * lengkapnya tetap hidup di /services, /about, dan halaman detail karya.
 */
const LANGKAH = [
  {
    title: "Anda cerita",
    body: "Kirim pesan singkat atau isi kebutuhan terpandu. Tidak perlu menyiapkan dokumen, istilah teknis, atau anggaran pasti lebih dulu.",
  },
  {
    title: "Kami kirim rincian",
    body: `Cakupan pekerjaan, jadwal, dan biaya kami tuliskan lengkap dalam ${WAKTU_BALAS}. Anda menyetujuinya dulu, baru pekerjaan dimulai.`,
  },
  {
    title: "Kami kerjakan bertahap",
    body: "Anda melihat perkembangannya di tiap tahap. Setelah rilis, kami serahkan kodenya dan mengajari tim Anda mengelola isinya sendiri.",
  },
];

export function StartSteps() {
  return (
    <div>
      <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        {LANGKAH.map((langkah, index) => (
          <li key={langkah.title}>
            <h3 className="display-sm flex items-baseline gap-2 text-[0.9375rem]">
              <span className="text-link font-mono text-xs">{index + 1}</span>
              {langkah.title}
            </h3>
            <p className="text-muted-foreground mt-2 leading-relaxed">{langkah.body}</p>
          </li>
        ))}
      </ol>

      <div className="border-border bg-card mt-10 overflow-hidden rounded-xl border">
        <p className="border-border text-heading border-b px-6 py-4 font-medium">
          Perkiraan waktu pengerjaan
        </p>
        <dl className="divide-border divide-y">
          {DURASI.map((item) => (
            <div key={item.jenis} className="flex items-baseline justify-between gap-6 px-6 py-4">
              <dt className="text-muted-foreground">{item.jenis}</dt>
              <dd className="text-heading shrink-0 font-medium tabular-nums">{item.waktu}</dd>
            </div>
          ))}
        </dl>
        <p className="border-border text-faint border-t px-6 py-4 text-xs leading-relaxed">
          Perkiraan awal, bukan janji jadwal. Waktu pastinya kami sebutkan bersama penawaran setelah
          cakupan pekerjaan disepakati.
        </p>
      </div>
    </div>
  );
}
