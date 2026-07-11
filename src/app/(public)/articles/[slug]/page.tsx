import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedArticleBySlug, getRelatedArticles } from "@/modules/articles/article.dal";
import { getSeoMeta } from "@/modules/seo/seo.dal";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return { title: "Artikel tidak ditemukan" };
  const seo = await getSeoMeta("article", article.id);
  const title = seo.metaTitle || article.title;
  const description = seo.metaDescription || article.summary || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.id, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.summary ?? undefined,
    datePublished: article.publishedAt?.toISOString(),
    author: article.authorName ? { "@type": "Person", name: article.authorName } : undefined,
  };

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/articles" className="text-sm text-muted-foreground hover:text-foreground">
        ← Semua artikel
      </Link>

      <header className="mt-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {article.categoryName ? <span>{article.categoryName}</span> : null}
          <span>{article.readingTime} mnt baca</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{article.title}</h1>
        {article.summary ? (
          <p className="mt-4 text-lg text-muted-foreground">{article.summary}</p>
        ) : null}
        {article.authorName ? (
          <p className="mt-4 text-sm text-muted-foreground">Oleh {article.authorName}</p>
        ) : null}
      </header>

      {article.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverUrl}
          alt={article.title}
          className="mt-8 aspect-video w-full rounded-xl object-cover"
        />
      ) : null}

      <div
        className="prose mt-10 max-w-none"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: article.contentHtml ?? "" }}
      />

      {article.tags.length > 0 ? (
        <div className="mt-10 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag.slug}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-lg font-semibold tracking-tight">Artikel terkait</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/articles/${item.slug}`}
                className="rounded-lg border border-border p-4 transition-colors hover:border-foreground/20"
              >
                <h3 className="text-sm font-medium">{item.title}</h3>
                <span className="mt-2 block text-xs text-muted-foreground">
                  {item.readingTime} mnt baca
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
