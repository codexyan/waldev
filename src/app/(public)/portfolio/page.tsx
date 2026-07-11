import type { Metadata } from "next";
import Link from "next/link";
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
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">Portfolio</h1>
        <p className="mt-3 text-muted-foreground">
          Sebagian proyek yang telah kami bangun untuk berbagai klien.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="mt-16 text-muted-foreground">Belum ada proyek yang ditampilkan.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((item) => (
            <Link
              key={item.slug}
              href={`/portfolio/${item.slug}`}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
            >
              <span className="text-xs text-muted-foreground">
                {item.isConfidential ? "Confidential Project" : (item.clientName ?? "Proyek")}
              </span>
              <h2 className="mt-2 text-lg font-semibold tracking-tight group-hover:text-primary">
                {item.title}
              </h2>
              {item.summary ? (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.summary}</p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
