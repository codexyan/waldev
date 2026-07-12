import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listPublishedPortfolios } from "@/modules/portfolio/portfolio.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Proyek digital yang telah dikerjakan WalDev.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const rows = await listPublishedPortfolios();

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <header className="max-w-2xl" data-reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Karya Kami</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Portfolio</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Sebagian proyek yang telah kami bangun untuk berbagai klien.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="mt-16 text-muted-foreground">Belum ada proyek yang ditampilkan.</p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((item, i) => (
            <Link
              key={item.slug}
              href={`/portfolio/${item.slug}`}
              className="card-lift group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card"
              data-reveal
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <div className="overflow-hidden">
                {item.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-muted transition-transform duration-500 group-hover:scale-105">
                    <span className="text-2xl font-semibold tracking-tight text-muted-foreground/40">
                      {item.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-foreground opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <div className="p-6">
                <span className="text-xs text-muted-foreground">
                  {item.isConfidential ? "Confidential Project" : (item.clientName ?? "Proyek")}
                </span>
                <h2 className="mt-1 text-lg font-semibold tracking-tight group-hover:text-primary">
                  {item.title}
                </h2>
                {item.summary ? (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
