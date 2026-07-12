import type { Metadata } from "next";
import {
  Clock,
  FileText,
  ListChecks,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { CollaborationForm } from "@/modules/leads/components/collaboration-form";

export const metadata: Metadata = {
  title: "Start a Project",
  description:
    "Jawab beberapa pertanyaan singkat, jawaban Anda otomatis tersusun menjadi brief proyek untuk tim WalDev.",
  alternates: { canonical: "/collaboration" },
};

const POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ListChecks,
    title: "Terpandu langkah demi langkah",
    body: "Cukup pilih jawaban yang tersedia. Tidak perlu paham istilah teknis atau bingung mulai dari mana.",
  },
  {
    icon: FileText,
    title: "Otomatis jadi brief proyek",
    body: "Jawaban Anda tersusun menjadi dokumen kebutuhan (PRD ringkas) yang langsung dipahami tim kami.",
  },
  {
    icon: Clock,
    title: "Sekitar 3 menit, respons 1x24 jam",
    body: "Lima langkah singkat, dan tim kami menghubungi Anda dalam 1x24 jam kerja.",
  },
  {
    icon: ShieldCheck,
    title: "Ide Anda aman",
    body: "Detail proyek dan data yang Anda kirim kami jaga kerahasiaannya.",
  },
];

export default function CollaborationPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div data-reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Kolaborasi
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Start a Project</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Tidak perlu menyiapkan dokumen apa pun. Jawab beberapa pertanyaan singkat, sisanya
            kami yang susun menjadi brief proyek.
          </p>

          <ul className="mt-10 space-y-6">
            {POINTS.map((point, i) => (
              <li
                key={point.title}
                className="flex gap-4"
                data-reveal
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <point.icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="font-medium tracking-tight">{point.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {point.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal style={{ transitionDelay: "120ms" }}>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <CollaborationForm />
          </div>
        </div>
      </div>
    </section>
  );
}
