import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ArrowLink } from "@/components/ui/arrow-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/constants";
import { getPublishedAppLink } from "@/modules/apps/app.dal";
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

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const [related, app] = await Promise.all([
    getRelatedArticles(article.id, 3),
    // Hanya aplikasi yang tayang yang ditautkan; draf tetap tersembunyi.
    article.appId ? getPublishedAppLink(article.appId) : Promise.resolve(null),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.summary ?? undefined,
    datePublished: article.publishedAt?.toISOString(),
    author: article.authorName ? { "@type": "Person", name: article.authorName } : undefined,
    ...(app
      ? {
          about: {
            "@type": "SoftwareApplication",
            name: app.name,
            url: new URL(`/apps/${app.slug}`, SITE.url).toString(),
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="border-border border-b">
        <div className="mx-auto max-w-3xl px-6 pt-8 pb-12">
          <ArrowLink href="/articles" className="text-muted-foreground hover:text-link" back>
            Semua tulisan
          </ArrowLink>

          <span className="text-faint mt-10 flex flex-wrap items-center gap-2 text-xs">
            {app ? (
              <>
                <Link href={`/apps/${app.slug}`} className="text-link hover:text-link-hover">
                  {app.name}
                </Link>
                <span aria-hidden>·</span>
              </>
            ) : null}
            {article.categoryName ? (
              <>
                <span className={app ? undefined : "text-link"}>{article.categoryName}</span>
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

          <h1 className="display mt-3 text-[2rem] text-balance sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          {article.summary ? (
            <p className="text-muted-foreground mt-5 leading-relaxed text-pretty">
              {article.summary}
            </p>
          ) : null}
          {article.authorName ? (
            <div className="mt-7 flex items-center gap-3">
              <span
                aria-hidden
                className="bg-surface flex h-8 w-8 items-center justify-center rounded-full font-medium"
              >
                {article.authorName.charAt(0)}
              </span>
              <span className="text-heading font-medium">{article.authorName}</span>
            </div>
          ) : null}
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-14">
        {article.coverUrl ? (
          <div className="border-border bg-surface overflow-hidden rounded-xl border">
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
          dangerouslySetInnerHTML={{ __html: article.contentHtml ?? "" }}
        />

        {article.tags.length > 0 ? (
          <div className="border-border mt-14 flex flex-wrap gap-2.5 border-t pt-8">
            {article.tags.map((tag) => (
              <span
                key={tag.slug}
                className="border-border bg-card text-muted-foreground rounded-md border px-2.5 py-1 text-xs"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : null}

        {/* Pengganti panel ajakan lama: tulisan yang membahas satu aplikasi
            mengantar pembaca kembali ke aplikasinya. */}
        {app ? (
          <div className="border-border bg-surface mt-14 rounded-xl border px-6 py-5">
            <p className="text-muted-foreground leading-relaxed">
              Tulisan ini bagian dari catatan pembuatan{" "}
              <span className="text-heading font-medium">{app.name}</span>.
            </p>
            <p className="mt-3">
              <ArrowLink href={`/apps/${app.slug}`}>Lihat aplikasinya</ArrowLink>
            </p>
          </div>
        ) : null}
      </article>

      {related.length > 0 ? (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <SectionHeading
            eyebrow="Lanjutkan membaca"
            title="Tulisan lainnya"
            className="border-border border-t pt-12"
          />
          <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} href={`/articles/${item.slug}`} className="group flex flex-col">
                <span className="text-faint text-xs">{item.readingTime} menit baca</span>
                <h3 className="display-sm mt-1.5 text-[0.9375rem] text-balance">{item.title}</h3>
                <span className="text-link mt-3 inline-flex items-center gap-1.5 font-medium">
                  Baca
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
