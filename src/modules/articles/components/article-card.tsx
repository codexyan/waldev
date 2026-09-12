import { ArrowRight, BookOpen } from "lucide-react";
import { StaticLink } from "@/components/ui/static-link";
import { cn } from "@/lib/utils";

/** Data satu kartu tulisan, sama dengan baris dari `listPublishedArticles`. */
export interface ArticleCardItem {
  title: string;
  slug: string;
  summary: string | null;
  readingTime: number;
  publishedAt: Date | null;
  categoryName: string | null;
  coverUrl: string | null;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(value);
}

export function ArticleMeta({
  article,
  className,
}: {
  article: ArticleCardItem;
  className?: string;
}) {
  return (
    <span className={cn("text-faint flex flex-wrap items-center gap-2 text-xs", className)}>
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

export function ArticleCover({ url, className }: { url: string | null; className?: string }) {
  return (
    <div
      className={cn(
        "border-border bg-surface group-hover:border-primary/40 overflow-hidden rounded-xl border transition-colors",
        className,
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="aspect-[16/10] w-full object-cover object-top" />
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center">
          <BookOpen className="text-faint h-8 w-8" aria-hidden />
        </div>
      )}
    </div>
  );
}

/**
 * Kartu tulisan untuk `/articles` dan bagian Tulisan terbaru di beranda.
 * `headingLevel` mengikuti posisi kartu: h2 di bawah judul halaman, h3 di bawah judul seksi.
 */
export function ArticleCard({
  article,
  headingLevel = "h2",
}: {
  article: ArticleCardItem;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <StaticLink href={`/articles/${article.slug}`} className="group flex flex-col">
      <ArticleCover url={article.coverUrl} className="mb-4" />
      <ArticleMeta article={article} />
      <Heading className="display-sm mt-2 text-base text-balance">{article.title}</Heading>
      {article.summary ? (
        <p className="text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{article.summary}</p>
      ) : null}
      <span className="text-link mt-3 inline-flex items-center gap-1.5 font-medium">
        Baca tulisan
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </StaticLink>
  );
}
