import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Tentang ${SITE.name}, studio digital yang membangun produk digital modern.`,
  alternates: { canonical: "/about" },
};

const VALUES = [
  { title: "Modern & Cepat", body: "Teknologi terkini dengan performa yang terukur." },
  { title: "Kualitas Premium", body: "Detail desain dan rekayasa yang matang di setiap proyek." },
  { title: "Kolaboratif", body: "Proses transparan, komunikatif, dan tepat sasaran." },
];

const PROCESS = [
  {
    title: "Empati",
    body: "Kami mendengarkan dan memahami pengguna serta tujuan bisnis Anda melalui riset dan wawancara.",
  },
  {
    title: "Definisi",
    body: "Temuan riset dirumuskan menjadi masalah inti yang jelas dan terukur untuk dipecahkan.",
  },
  {
    title: "Ideasi",
    body: "Kami mengeksplorasi berbagai alternatif solusi, lalu memilih pendekatan dengan dampak terbesar.",
  },
  {
    title: "Prototipe",
    body: "Wireframe dan desain interaktif dibuat lebih dulu agar solusi dapat dilihat dan dirasakan sejak awal.",
  },
  {
    title: "Uji & Iterasi",
    body: "Prototipe diuji bersama pengguna, disempurnakan, lalu dikembangkan hingga siap diluncurkan.",
  },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Tentang Kami</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">About {SITE.name}</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        {SITE.name} adalah studio digital yang membangun website, sistem informasi, web
        application, dan produk digital lain, dari ide hingga peluncuran. Kami membantu UMKM,
        perusahaan, startup, hingga instansi mewujudkan produk digital yang modern, cepat, dan
        dapat diandalkan.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold tracking-tight">{v.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Proses Kami</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Berbasis design thinking
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Setiap proyek kami jalankan dengan pendekatan design thinking. Solusi tidak berangkat
          dari asumsi, melainkan dari pemahaman mendalam terhadap pengguna dan kebutuhan bisnis,
          kemudian diuji dan disempurnakan secara bertahap.
        </p>
        <ol className="mt-8 space-y-4">
          {PROCESS.map((step, i) => (
            <li key={step.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold tracking-tight">Punya proyek dalam pikiran?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Mari kita wujudkan bersama.</p>
        <Link href="/collaboration" className="mt-6 inline-block">
          <Button size="lg">Start a Project</Button>
        </Link>
      </div>
    </section>
  );
}
