import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Tentang ${SITE.name} — studio digital yang membangun produk digital modern.`,
  alternates: { canonical: "/about" },
};

const VALUES = [
  { title: "Modern & Cepat", body: "Teknologi terkini dengan performa yang terukur." },
  { title: "Kualitas Premium", body: "Detail desain dan rekayasa yang matang di setiap proyek." },
  { title: "Kolaboratif", body: "Proses transparan, komunikatif, dan tepat sasaran." },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">About {SITE.name}</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        {SITE.name} adalah studio digital yang membangun website, sistem informasi, web
        application, dan produk digital lain — dari ide hingga peluncuran. Kami membantu UMKM,
        perusahaan, startup, hingga instansi mewujudkan produk digital yang modern, cepat, dan
        dapat diandalkan.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold">{v.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold tracking-tight">Punya proyek dalam pikiran?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Mari kita wujudkan bersama.</p>
        <Link href="/collaboration" className="mt-6 inline-block">
          <Button size="lg">Start a Project</Button>
        </Link>
      </div>
    </section>
  );
}
