import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ArrowLink } from "@/components/ui/arrow-link";
import { SECTION, SHELL } from "@/components/ui/shell";
import { StaticLink } from "@/components/ui/static-link";
import { listPublishedArticles } from "@/modules/articles/article.dal";
import {
  ArticleCard,
  ArticleCover,
  ArticleMeta,
  type ArticleCardItem,
} from "@/modules/articles/components/article-card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tulisan",
  description:
    "Tulisan seputar pembuatan aplikasi WalDev, misalnya alasan di balik sebuah keputusan teknis atau kendala yang muncul saat membangun.",
  alternates: { canonical: "/articles" },
};

export default async function ArticlesPage() {
  const { rows } = await listPublishedArticles({ limit: 12 });
  const [featured, ...rest] = rows;

  return (
    <>
      <PageHeader
        eyebrow="Tulisan"
        title="Tulisan seputar pembuatan aplikasi."
        description="Bahasan yang terlalu panjang untuk catatan singkat, misalnya alasan memilih sebuah pendekatan atau kendala yang muncul saat membangun."
      />

      {rows.length === 0 ? (
        <section className={cn(SHELL, SECTION)}>
          <p className="text-muted-foreground">Belum ada tulisan.</p>
          <p className="mt-4">
            <ArrowLink href="/">Lihat daftar aplikasi</ArrowLink>
          </p>
        </section>
      ) : (
        <section className={cn(SHELL, SECTION)}>
          {featured ? <FeaturedArticle article={featured} /> : null}

          {rest.length > 0 ? (
            <div className="mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : null}
        </section>
      )}
    </>
  );
}

function FeaturedArticle({ article }: { article: ArticleCardItem }) {
  return (
    <StaticLink
      href={`/articles/${article.slug}`}
      className="group grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12"
    >
      <ArticleCover url={article.coverUrl} />
      <div>
        <p className="label text-link">Tulisan terbaru</p>
        <h2 className="display mt-3 text-2xl text-balance sm:text-[1.75rem]">{article.title}</h2>
        {article.summary ? (
          <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed text-pretty">
            {article.summary}
          </p>
        ) : null}
        <ArticleMeta article={article} className="mt-4" />
        <span className="text-link mt-4 inline-flex items-center gap-1.5 font-medium">
          Baca selengkapnya
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </StaticLink>
  );
}
