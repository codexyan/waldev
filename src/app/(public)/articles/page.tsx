import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { listPublishedArticles } from "@/modules/articles/article.dal";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jurnal",
  description:
    "Catatan teknis, prinsip desain, dan wawasan pengembangan produk digital dari tim WalDev.",
  alternates: { canonical: "/articles" },
};

function formatDate(value: Date | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(value);
}

interface ArticleItem {
  title: string;
  slug: string;
  summary: string | null;
  readingTime: number;
  publishedAt: Date | null;
  categoryName: string | null;
  coverUrl: string | null;
}

export default async function ArticlesPage() {
  const { rows } = await listPublishedArticles({ limit: 12 });
  const [featured, ...rest] = rows;

  return (
    <>
      <PageHeader
        eyebrow="Jurnal"
        title={["Kami menulis apa", "yang kami kerjakan."]}
        marked="kerjakan."
        description="Catatan teknis, prinsip desain, dan pelajaran dari proyek nyata. Ditulis untuk dibaca pemilik bisnis maupun sesama pengembang."
      />

      {rows.length === 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <p className="text-muted-foreground">Belum ada tulisan yang dipublikasikan.</p>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-10">
          {featured ? <FeaturedArticle article={featured} /> : null}

          {rest.length > 0 ? (
            <div className="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article, index) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  delay={(index % 3) * 80}
                />
              ))}
            </div>
          ) : null}
        </section>
      )}
    </>
  );
}

function Meta({ article, className }: { article: ArticleItem; className?: string }) {
  return (
    <span className={cn("label-mono flex flex-wrap items-center gap-2.5 text-muted-foreground", className)}>
      {article.categoryName ? (
        <>
          <span>{article.categoryName}</span>
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
  );
}

function FeaturedArticle({ article }: { article: ArticleItem }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group grid gap-10 border-t border-border pt-10 lg:grid-cols-2 lg:items-center lg:gap-16"
      data-reveal
    >
      <div className="spotlight overflow-hidden rounded-lg border border-border bg-muted" data-spotlight>
        {article.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverUrl}
            alt=""
            className="aspect-[16/10] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="bg-grid flex aspect-[16/10] w-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-foreground/15" aria-hidden />
          </div>
        )}
      </div>
      <div>
        <span className="label-mono inline-flex items-center gap-2 text-muted-foreground">
          <span aria-hidden className="h-2 w-2 bg-signal" />
          Tulisan terbaru
        </span>
        <h2 className="display mt-6 text-balance text-3xl sm:text-4xl">{article.title}</h2>
        {article.summary ? (
          <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
        ) : null}
        <Meta article={article} className="mt-7" />
        <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium">
          <span className="link-sweep">Baca selengkapnya</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function ArticleCard({ article, delay }: { article: ArticleItem; delay: number }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col border-t border-border pt-7"
      data-reveal
      style={{ transitionDelay: `${delay}ms` }}
    >
      {article.coverUrl ? (
        <div className="mb-6 overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverUrl}
            alt=""
            className="aspect-[16/10] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </div>
      ) : null}
      <Meta article={article} />
      <h2 className="display-sm mt-5 text-balance text-xl">{article.title}</h2>
      {article.summary ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {article.summary}
        </p>
      ) : null}
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
        <span className="link-sweep">Baca tulisan</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
