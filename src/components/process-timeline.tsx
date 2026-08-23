interface Stage {
  title: string;
  body: string;
}

export const PROCESS_STAGES: Stage[] = [
  {
    title: "Memahami kebutuhan",
    body: "Kami menggali kondisi bisnis, kebiasaan penggunanya, dan tujuan Anda lewat obrolan terarah, sebelum satu baris kode ditulis.",
  },
  {
    title: "Menyusun rencana",
    body: "Temuan tadi dirumuskan menjadi daftar pekerjaan, alur, dan urutan prioritas yang jelas, lengkap dengan ukuran keberhasilannya.",
  },
  {
    title: "Merancang tampilan",
    body: "Rancangan tampilan dibuat dan bisa Anda coba lebih dulu, sehingga perubahan besar terjadi di gambar, bukan setelah kode jadi.",
  },
  {
    title: "Membangun",
    body: "Fitur dibangun bertahap dengan kode yang rapi dan aman. Anda bisa melihat perkembangannya, bukan menunggu dalam gelap.",
  },
  {
    title: "Meluncurkan dan merawat",
    body: "Peluncuran tanpa drama, lalu pemantauan dan penyempurnaan berdasarkan pemakaian nyata serta masukan Anda.",
  },
];

/**
 * Alur kerja dari awal sampai akhir.
 *
 * Garis penghubung yang terisi mengikuti gulir sudah dilepas: ia menuntut
 * dukungan `animation-timeline` yang belum merata, dan yang sebenarnya perlu
 * dibaca pengunjung hanyalah urutan tahapnya.
 */
export function ProcessTimeline() {
  return (
    <ol className="grid gap-8 sm:grid-cols-2">
      {PROCESS_STAGES.map((stage, index) => (
        <li key={stage.title}>
          <h3 className="display-sm flex items-baseline gap-2 text-[0.9375rem]">
            <span className="text-link font-mono text-xs">{index + 1}</span>
            {stage.title}
          </h3>
          <p className="text-muted-foreground mt-2 max-w-md leading-relaxed">{stage.body}</p>
        </li>
      ))}
    </ol>
  );
}
