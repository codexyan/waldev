import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CtaPanel } from "@/components/cta-panel";
import { Eyebrow } from "@/components/ui/section-heading";
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
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-noise relative overflow-hidden border-b border-border">
        <div aria-hidden className="bg-grid absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-6 pb-14 pt-10">
          <Link
            href="/articles"
            className="link-sweep group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Semua tulisan
          </Link>

          <span className="label-mono animate-fade-up mt-12 flex flex-wrap items-center gap-2.5 text-muted-foreground [animation-delay:80ms]">
            {article.categoryName ? (
              <>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="h-2 w-2 bg-signal" />
                  {article.categoryName}
                </span>
                <span aria-hidden>·</span>
              </>
            ) : null}
            <span>{article.readingTime} menit baca</span>
            {article.publishedAt ? (
              <>
                <span aria-hidden>·</span>
                <span>{formatDate(article.publishedAt)}</span>
              </>
            ) : null}
          </span>

          <h1 className="display animate-fade-up mt-7 text-balance text-[clamp(2rem,5.5vw,3.5rem)] [animation-delay:160ms]">
            {article.title}
          </h1>
          {article.summary ? (
            <p className="animate-fade-up mt-6 text-pretty text-lg leading-relaxed text-muted-foreground [animation-delay:260ms]">
              {article.summary}
            </p>
          ) : null}
          {article.authorName ? (
            <div className="animate-fade-up mt-9 flex items-center gap-3 [animation-delay:340ms]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-sm font-medium">
                {article.authorName.charAt(0)}
              </span>
              <span>
                <span className="block text-sm font-medium">{article.authorName}</span>
                <span className="label-mono mt-1 block text-muted-foreground">Tim WalDev</span>
              </span>
            </div>
          ) : null}
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-14">
        {article.coverUrl ? (
          <div className="overflow-hidden rounded-lg border border-border" data-reveal="wipe">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverUrl}
              alt={article.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        ) : null}

        <div
          className="prose mt-12 max-w-none"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: article.contentHtml ?? "" }}
        />

        {article.tags.length > 0 ? (
          <div className="mt-14 flex flex-wrap gap-2.5 border-t border-border pt-8">
            {article.tags.map((tag) => (
              <span
                key={tag.slug}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors duration-300 hover:border-foreground/40 hover:text-foreground"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : null}
      </article>

      {related.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
          <div className="border-t border-border pt-6" data-reveal>
            <Eyebrow>Lanjutkan membaca</Eyebrow>
            <h2 className="display mt-8 text-balance text-3xl sm:text-4xl">Tulisan terkait</h2>
          </div>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {related.map((item, index) => (
              <Link
                key={item.slug}
                href={`/articles/${item.slug}`}
                className="group flex flex-col border-t border-border pt-7"
                data-reveal
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <span className="label-mono text-muted-foreground">
                  {item.readingTime} menit baca
                </span>
                <h3 className="display-sm mt-5 text-balance text-lg">{item.title}</h3>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                  <span className="link-sweep">Baca</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-10">
        <CtaPanel
          eyebrow="Butuh bantuan?"
          title="Ingin menerapkannya di produk Anda?"
          body="Kami bantu terjemahkan tulisan seperti ini menjadi pekerjaan nyata, mulai dari audit singkat sampai pengerjaan penuh."
          ctaLabel="Bicarakan dengan kami"
        />
      </section>
    </>
  );
}
