import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { listPublishedArticles } from "@/modules/articles/article.dal";
import { listPublishedPortfolios } from "@/modules/portfolio/portfolio.dal";
import { listActiveServices } from "@/modules/services/service.dal";
import { listPublishedTestimonials } from "@/modules/testimonials/testimonial.dal";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, portfolios, articlesResult, testimonials] = await Promise.all([
    listActiveServices(),
    listPublishedPortfolios(),
    listPublishedArticles({ limit: 3 }),
    listPublishedTestimonials(),
  ]);
  const articles = articlesResult.rows;
  const featuredServices = services.slice(0, 6);
  const featuredPortfolio = portfolios.slice(0, 3);
  const featuredTestimonials = testimonials.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
            Digital Studio
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">{SITE.tagline}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{SITE.description}</p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/collaboration">
              <Button size="lg">Start a Project</Button>
            </Link>
            <Link href="/portfolio">
              <Button size="lg" variant="outline">
                Lihat Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      {featuredServices.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Layanan</h2>
            <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground">
              Semua layanan →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
              >
                <h3 className="font-semibold group-hover:text-primary">{s.name}</h3>
                {s.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Portfolio */}
      {featuredPortfolio.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Portfolio Pilihan</h2>
            <Link href="/portfolio" className="text-sm text-muted-foreground hover:text-foreground">
              Semua proyek →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPortfolio.map((p) => (
              <Link
                key={p.slug}
                href={`/portfolio/${p.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
              >
                {p.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumbnailUrl} alt="" className="mb-4 aspect-video w-full rounded-lg object-cover" />
                ) : null}
                <span className="text-xs text-muted-foreground">
                  {p.isConfidential ? "Confidential Project" : (p.clientName ?? "Proyek")}
                </span>
                <h3 className="mt-1 font-semibold group-hover:text-primary">{p.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Testimonials */}
      {featuredTestimonials.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Kata Klien</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTestimonials.map((t, i) => (
              <figure key={`${t.authorName}-${i}`} className="rounded-xl border border-border bg-card p-6">
                <blockquote className="text-sm text-muted-foreground">“{t.content}”</blockquote>
                <figcaption className="mt-4 text-sm font-medium">
                  {t.authorName}
                  {t.company ? <span className="text-muted-foreground"> · {t.company}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* Articles */}
      {articles.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Artikel Terbaru</h2>
            <Link href="/articles" className="text-sm text-muted-foreground hover:text-foreground">
              Semua artikel →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
              >
                <span className="text-xs text-muted-foreground">{a.readingTime} mnt baca</span>
                <h3 className="mt-1 font-semibold group-hover:text-primary">{a.title}</h3>
                {a.summary ? (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.summary}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Siap membangun produk digital?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Ceritakan ide Anda — tim {SITE.name} siap mewujudkannya.
          </p>
          <Link href="/collaboration" className="mt-8 inline-block">
            <Button size="lg">Start a Project</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
