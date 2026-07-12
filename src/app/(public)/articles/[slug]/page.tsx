import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, UserRound } from "lucide-react";
import { ReadingProgress } from "@/components/reading-progress";
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
      <ReadingProgress />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/articles"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua artikel
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {article.categoryName ? (
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {article.categoryName}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readingTime} mnt baca
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(article.publishedAt)}
          </span>
        </div>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.15]">
          {article.title}
        </h1>
        {article.summary ? (
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
        ) : null}
        {article.authorName ? (
          <div className="mt-6 flex items-center gap-3 border-y border-border py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium">{article.authorName}</p>
              <p className="text-xs text-muted-foreground">Tim WalDev</p>
            </div>
          </div>
        ) : null}
      </header>

      {article.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverUrl}
          alt={article.title}
          className="mt-8 aspect-video w-full rounded-2xl border border-border object-cover"
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
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-16 border-t border-border pt-10" data-reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Lanjutkan membaca
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">Artikel terkait</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/articles/${item.slug}`}
                className="card-lift group rounded-lg border border-border p-4"
              >
                <h3 className="text-sm font-medium group-hover:text-primary">{item.title}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
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
