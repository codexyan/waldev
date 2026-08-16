import type { Metadata } from "next";
import { FileSignature, Gem, Repeat2, type LucideIcon } from "lucide-react";
import { CtaPanel } from "@/components/cta-panel";
import { PageHeader } from "@/components/page-header";
import { ProcessTimeline } from "@/components/process-timeline";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tentang",
  description: `Tentang ${SITE.name}, studio digital yang merancang dan membangun produk digital dari riset sampai peluncuran.`,
  alternates: { canonical: "/about" },
};

const PRINCIPLES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: FileSignature,
    title: "Jelas sejak awal",
    body: "Cakupan, jadwal, dan biaya disepakati tertulis sebelum pekerjaan dimulai. Tidak ada tambahan biaya yang muncul tiba tiba di tengah jalan.",
  },
  {
    icon: Gem,
    title: "Detail yang terasa",
    body: "Kecepatan muat, keterbacaan, dan alur yang masuk akal kami perlakukan sepenting daftar fiturnya. Itulah yang membedakan produk yang enak dipakai.",
  },
  {
    icon: Repeat2,
    title: "Dibangun untuk dilanjutkan",
    body: "Kode dan dokumentasi ditulis agar tim mana pun bisa meneruskan, termasuk tim internal Anda sendiri di kemudian hari.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tentang Kami"
        title={["Studio kecil,", "standar besar."]}
        marked="besar."
        description={`${SITE.name} merancang dan membangun website, sistem informasi, dan produk digital lain untuk UMKM, perusahaan, startup, hingga instansi. Satu tim mengerjakan dari riset sampai peluncuran.`}
      />

      {/* Pernyataan sikap dalam tipografi besar. */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-10">
        <div className="border-t border-border pt-10" data-reveal>
          <Eyebrow>Sikap kami</Eyebrow>
          <p className="display mt-10 max-w-4xl text-balance text-2xl leading-[1.25] sm:text-4xl lg:text-[2.75rem]">
            Produk digital yang baik terasa sederhana bagi penggunanya. Itu hanya terjadi kalau
            kerumitannya sudah <span className="marker">diselesaikan</span> lebih dulu di belakang
            layar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28 lg:px-10">
        <SectionHeading
          index="01"
          eyebrow="Prinsip"
          title="Tiga hal yang tidak kami tawar"
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {PRINCIPLES.map((principle, index) => (
            <div
              key={principle.title}
              className="group bg-background p-8 transition-colors duration-500 hover:bg-muted"
              data-reveal
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border transition-all duration-500 group-hover:border-transparent group-hover:bg-signal group-hover:text-signal-foreground">
                <principle.icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="display-sm mt-6 text-lg">{principle.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {principle.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="border-t border-border pt-6" data-reveal>
              <div className="flex items-start justify-between gap-6">
                <Eyebrow>Proses</Eyebrow>
                <span className="label-mono text-muted-foreground">02</span>
              </div>
              <h2 className="display mt-8 text-balance text-3xl sm:text-4xl">
                Berbasis design thinking
              </h2>
              <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
                Kami tidak memulai dari asumsi. Setiap keputusan desain berangkat dari pemahaman
                atas pengguna dan tujuan bisnis Anda, lalu diuji dan disempurnakan bertahap sampai
                benar benar tepat sasaran.
              </p>
            </div>
          </div>
          <ProcessTimeline />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-10">
        <CtaPanel
          title="Punya proyek dalam pikiran?"
          body="Kami senang mendengar rencana Anda, sekalipun masih berupa gagasan kasar. Obrolan pertama selalu gratis dan tanpa kewajiban apa pun."
        />
      </section>
    </>
  );
}
