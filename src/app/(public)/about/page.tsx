import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Ear,
  FlaskConical,
  Gem,
  HeartHandshake,
  Lightbulb,
  PenTool,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Tentang ${SITE.name}, studio digital yang membangun produk digital modern.`,
  alternates: { canonical: "/about" },
};

const VALUES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Zap, title: "Modern & Cepat", body: "Teknologi terkini dengan performa yang terukur." },
  {
    icon: Gem,
    title: "Kualitas Premium",
    body: "Detail desain dan rekayasa yang matang di setiap proyek.",
  },
  {
    icon: HeartHandshake,
    title: "Kolaboratif",
    body: "Proses transparan, komunikatif, dan tepat sasaran.",
  },
];

const PROCESS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Ear,
    title: "Empati",
    body: "Kami mendengarkan dan memahami pengguna serta tujuan bisnis Anda melalui riset dan wawancara.",
  },
  {
    icon: Target,
    title: "Definisi",
    body: "Temuan riset dirumuskan menjadi masalah inti yang jelas dan terukur untuk dipecahkan.",
  },
  {
    icon: Lightbulb,
    title: "Ideasi",
    body: "Kami mengeksplorasi berbagai alternatif solusi, lalu memilih pendekatan dengan dampak terbesar.",
  },
  {
    icon: PenTool,
    title: "Prototipe",
    body: "Wireframe dan desain interaktif dibuat lebih dulu agar solusi dapat dilihat dan dirasakan sejak awal.",
  },
  {
    icon: FlaskConical,
    title: "Uji & Iterasi",
    body: "Prototipe diuji bersama pengguna, disempurnakan, lalu dikembangkan hingga siap diluncurkan.",
  },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <header data-reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Tentang Kami</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">About {SITE.name}</h1>
        <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
          {SITE.name} adalah studio digital yang membangun website, sistem informasi, web
          application, dan produk digital lain, dari ide hingga peluncuran. Kami membantu UMKM,
          perusahaan, startup, hingga instansi mewujudkan produk digital yang modern, cepat, dan
          dapat diandalkan.
        </p>
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {VALUES.map((v, i) => (
          <div
            key={v.title}
            className="card-lift group rounded-xl border border-border bg-card p-6"
            data-reveal
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
              <v.icon className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-semibold tracking-tight">{v.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <div data-reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Proses Kami
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Berbasis design thinking
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Setiap proyek kami jalankan dengan pendekatan design thinking. Solusi tidak berangkat
            dari asumsi, melainkan dari pemahaman mendalam terhadap pengguna dan kebutuhan bisnis,
            kemudian diuji dan disempurnakan secara bertahap.
          </p>
        </div>
        <ol className="relative mt-8 space-y-5">
          <div
            aria-hidden
            className="absolute bottom-8 left-[2.6rem] top-8 w-px bg-gradient-to-b from-primary/40 via-border to-border"
          />
          {PROCESS.map((step, i) => (
            <li
              key={step.title}
              className="card-lift relative flex gap-4 rounded-xl border border-border bg-card p-5"
              data-reveal
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <step.icon className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-semibold tracking-tight">{step.title}</h3>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-16" data-reveal>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-[-9rem] h-[16rem] w-[26rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[90px]"
          />
          <div className="relative">
            <h2 className="text-balance text-2xl font-semibold tracking-tight">
              Punya proyek dalam pikiran?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Mari kita wujudkan bersama.</p>
            <Link href="/collaboration" className="mt-6 inline-block">
              <Button size="lg">
                Start a Project
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
