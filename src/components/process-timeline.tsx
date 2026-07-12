import { Code2, PenTool, Rocket, Search, Target } from "lucide-react";
import type { ComponentType } from "react";

interface Stage {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}

const STAGES: Stage[] = [
  {
    icon: Search,
    title: "Discovery & Riset",
    body: "Kami menggali kebutuhan bisnis, pengguna, dan tujuan proyek lewat riset dan diskusi mendalam.",
  },
  {
    icon: Target,
    title: "Strategi & Definisi",
    body: "Temuan dirumuskan menjadi cakupan, alur, dan prioritas fitur yang jelas dan terukur.",
  },
  {
    icon: PenTool,
    title: "Desain & Prototipe",
    body: "Wireframe hingga UI interaktif dibuat lebih dulu, agar solusi bisa diuji sebelum dibangun.",
  },
  {
    icon: Code2,
    title: "Development",
    body: "Fitur dibangun bertahap dengan kode yang rapi, aman, dan performa yang diukur di setiap iterasi.",
  },
  {
    icon: Rocket,
    title: "Peluncuran & Iterasi",
    body: "Peluncuran mulus, pemantauan, lalu penyempurnaan berkelanjutan berdasarkan data dan masukan.",
  },
];

/** Visualisasi proses pengerjaan end-to-end (timeline vertikal). */
export function ProcessTimeline() {
  return (
    <ol className="relative mt-8 space-y-8">
      {/* garis penghubung */}
      <div
        aria-hidden
        className="absolute bottom-4 left-5 top-4 w-px bg-gradient-to-b from-primary/50 via-border to-border"
      />
      {STAGES.map((stage, i) => (
        <li key={stage.title} className="relative flex gap-5">
          <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm">
            <stage.icon className="h-4 w-4" />
          </span>
          <div className="pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tabular-nums text-muted-foreground/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-semibold tracking-tight">{stage.title}</h3>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{stage.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
