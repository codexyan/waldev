import type { Metadata } from "next";
import { Clock, FileText, ListChecks, ShieldCheck, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CollaborationForm } from "@/modules/leads/components/collaboration-form";

export const metadata: Metadata = {
  title: "Mulai Proyek",
  description:
    "Jawab beberapa pertanyaan singkat, jawaban Anda otomatis tersusun menjadi brief proyek untuk tim WalDev.",
  alternates: { canonical: "/collaboration" },
};

const POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ListChecks,
    title: "Terpandu langkah demi langkah",
    body: "Cukup pilih jawaban yang tersedia. Tidak perlu paham istilah teknis atau bingung harus mulai dari mana.",
  },
  {
    icon: FileText,
    title: "Otomatis menjadi brief proyek",
    body: "Jawaban Anda tersusun menjadi dokumen kebutuhan ringkas yang langsung dipahami tim kami.",
  },
  {
    icon: Clock,
    title: "Sekitar 3 menit saja",
    body: "Lima langkah singkat, lalu tim kami menghubungi Anda dalam 1x24 jam kerja.",
  },
  {
    icon: ShieldCheck,
    title: "Ide Anda aman",
    body: "Detail proyek dan data yang Anda kirim kami jaga kerahasiaannya.",
  },
];

export default function CollaborationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Mulai Proyek"
        title={["Tidak perlu siapkan", "dokumen apa pun."]}
        marked="apa pun."
        description="Jawab beberapa pertanyaan singkat. Sisanya kami yang susun menjadi brief proyek yang rapi, siap dibaca dan ditindaklanjuti."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ul className="space-y-px overflow-hidden rounded-lg border border-border bg-border">
              {POINTS.map((point, index) => (
                <li
                  key={point.title}
                  className="group flex gap-5 bg-background p-7 transition-colors duration-500 hover:bg-muted"
                  data-reveal
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border transition-all duration-500 group-hover:border-transparent group-hover:bg-signal group-hover:text-signal-foreground">
                    <point.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="display-sm text-base">{point.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {point.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal style={{ transitionDelay: "120ms" }}>
            <div className="rounded-lg border border-border bg-card p-7 sm:p-9">
              <CollaborationForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
