import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { listPublishedArticles } from "@/modules/articles/article.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles",
  description: "Artikel, wawasan, dan studi teknis dari WalDev.",
  alternates: { canonical: "/articles" },
};

function formatDate(value: Date | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(value);
}

export default async function ArticlesPage() {
  const { rows } = await listPublishedArticles({ limit: 12 });

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <header className="max-w-2xl" data-reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Blog</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Articles</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Wawasan, studi teknis, dan catatan pengembangan produk digital.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="mt-16 text-muted-foreground">Belum ada artikel yang dipublikasikan.</p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((article, i) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="card-lift group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
              data-reveal
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <div className="overflow-hidden">
                {article.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.coverUrl}
                    alt=""
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-muted transition-transform duration-500 group-hover:scale-105">
                    <BookOpen className="h-7 w-7 text-muted-foreground/40" aria-hidden />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {article.categoryName ? (
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                      {article.categoryName}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {article.readingTime} mnt baca
                  </span>
                </div>
                <h2 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-primary">
                  {article.title}
                </h2>
                {article.summary ? (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {article.summary}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-1 items-end justify-between text-xs text-muted-foreground">
                  <span>{formatDate(article.publishedAt)}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Baca <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
