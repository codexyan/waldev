import { Code2, PenTool, Rocket, Search, Target, type LucideIcon } from "lucide-react";

interface Stage {
  icon: LucideIcon;
  title: string;
  body: string;
}

export const PROCESS_STAGES: Stage[] = [
  {
    icon: Search,
    title: "Discovery dan riset",
    body: "Kami menggali kebutuhan bisnis, perilaku pengguna, dan tujuan proyek lewat diskusi terarah sebelum satu baris kode ditulis.",
  },
  {
    icon: Target,
    title: "Strategi dan definisi",
    body: "Temuan riset dirumuskan menjadi cakupan, alur, dan prioritas fitur yang jelas, lengkap dengan ukuran keberhasilan.",
  },
  {
    icon: PenTool,
    title: "Desain dan prototipe",
    body: "Wireframe sampai antarmuka interaktif dibuat lebih dulu, sehingga Anda bisa melihat dan mencoba solusinya sebelum dibangun.",
  },
  {
    icon: Code2,
    title: "Pengembangan",
    body: "Fitur dibangun bertahap dengan kode yang rapi dan aman, dengan performa yang diukur di setiap iterasi.",
  },
  {
    icon: Rocket,
    title: "Peluncuran dan iterasi",
    body: "Peluncuran mulus, pemantauan, lalu penyempurnaan berkelanjutan berdasarkan data penggunaan dan masukan nyata.",
  },
];

/**
 * Alur kerja end to end. Garis penghubung terisi mengikuti scroll pada
 * browser yang mendukung animasi berbasis timeline.
 */
export function ProcessTimeline({ compact = false }: { compact?: boolean }) {
  return (
    <ol className="relative">
      <div aria-hidden className="absolute bottom-8 left-6 top-8 w-px bg-border" />
      <div aria-hidden className="progress-line absolute bottom-8 left-6 top-8 w-px" />

      {PROCESS_STAGES.map((stage, index) => (
        <li
          key={stage.title}
          className="relative flex gap-6"
          data-reveal
          style={{ transitionDelay: `${index * 70}ms` }}
        >
          <span className="label-mono relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className={compact ? "pb-8 pt-3" : "pb-10 pt-3"}>
            <div className="flex items-center gap-2.5">
              <stage.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              <h3 className="display-sm text-lg">{stage.title}</h3>
            </div>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {stage.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
