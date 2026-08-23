import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { CtaPanel } from "@/components/cta-panel";
import { PageHeader } from "@/components/page-header";
import { SECTION, SHELL } from "@/components/ui/shell";
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
        title="Kami menulis apa yang kami kerjakan."
        description="Catatan teknis, prinsip desain, dan pelajaran dari proyek nyata. Ditulis untuk dibaca pemilik bisnis maupun sesama pengembang."
      />

      {rows.length === 0 ? (
        <section className={cn(SHELL, SECTION)}>
          <p className="text-muted-foreground">Belum ada tulisan yang dipublikasikan.</p>
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

      {/* Pita ajakan yang dulu ada di kaki setiap halaman sudah dihapus, jadi
          halaman indeks jurnal perlu penutupnya sendiri agar tidak berakhir
          buntu tanpa satu pun jalan menghubungi. */}
      <section className={cn(SHELL, "pt-16 pb-4 sm:pt-24")}>
        <CtaPanel
          title="Punya pertanyaan yang belum terjawab di sini?"
          body="Kami senang menjawab langsung, termasuk bila ujungnya Anda memutuskan belum perlu membangun apa pun sekarang."
        />
      </section>
    </>
  );
}

function Meta({ article, className }: { article: ArticleItem; className?: string }) {
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

function Cover({ url, className }: { url: string | null; className?: string }) {
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

function FeaturedArticle({ article }: { article: ArticleItem }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12"
    >
      <Cover url={article.coverUrl} />
      <div>
        <p className="label text-link">Tulisan terbaru</p>
        <h2 className="display mt-3 text-2xl text-balance sm:text-[1.75rem]">{article.title}</h2>
        {article.summary ? (
          <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed text-pretty">
            {article.summary}
          </p>
        ) : null}
        <Meta article={article} className="mt-4" />
        <span className="text-link mt-4 inline-flex items-center gap-1.5 font-medium">
          Baca selengkapnya
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: ArticleItem }) {
  return (
    <Link href={`/articles/${article.slug}`} className="group flex flex-col">
      <Cover url={article.coverUrl} className="mb-4" />
      <Meta article={article} />
      <h2 className="display-sm mt-2 text-base text-balance">{article.title}</h2>
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
    </Link>
  );
}
