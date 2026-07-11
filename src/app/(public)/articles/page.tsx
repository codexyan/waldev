import type { Metadata } from "next";
import Link from "next/link";
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
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">Articles</h1>
        <p className="mt-3 text-muted-foreground">
          Wawasan, studi teknis, dan catatan pengembangan produk digital.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="mt-16 text-muted-foreground">Belum ada artikel yang dipublikasikan.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
            >
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {article.categoryName ? <span>{article.categoryName}</span> : null}
                <span>{article.readingTime} mnt baca</span>
              </div>
              <h2 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-primary">
                {article.title}
              </h2>
              {article.summary ? (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.summary}</p>
              ) : null}
              <span className="mt-4 text-xs text-muted-foreground">
                {formatDate(article.publishedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
