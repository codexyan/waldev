import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, Quote, Sparkles } from "lucide-react";
import { ServiceIcon } from "@/components/service-icon";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { listPublishedArticles } from "@/modules/articles/article.dal";
import { listPublishedPortfolios } from "@/modules/portfolio/portfolio.dal";
import { listActiveServices } from "@/modules/services/service.dal";
import { listPublishedTestimonials } from "@/modules/testimonials/testimonial.dal";

export const dynamic = "force-dynamic";

function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4" data-reveal>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {linkLabel ?? "Lihat semua"}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}

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

  // Kata terakhir tagline diberi aksen gradien.
  const taglineWords = SITE.tagline.replace(/\.$/, "").split(" ");
  const taglineLast = taglineWords.pop();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="bg-grid absolute inset-0" />
        <div
          aria-hidden
          className="absolute left-1/2 top-[-14rem] h-[26rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]"
        />
        {/* Orb mengapung: wrapper untuk posisi, inner untuk animasi float */}
        <div aria-hidden className="absolute left-[8%] top-24 hidden lg:block">
          <div className="animate-float h-40 w-40 rounded-full bg-primary/10 blur-[60px]" />
        </div>
        <div aria-hidden className="absolute right-[6%] top-48 hidden lg:block">
          <div className="animate-float h-52 w-52 rounded-full bg-primary/10 blur-[70px] [animation-delay:-4s]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pb-28 sm:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Digital Studio
            </span>
            <h1 className="animate-fade-up mt-6 text-balance text-4xl font-semibold tracking-tight [animation-delay:80ms] sm:text-6xl sm:leading-[1.1]">
              {taglineWords.join(" ")} <span className="text-gradient">{taglineLast}</span>.
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground [animation-delay:160ms]">
              {SITE.description}
            </p>
            <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-4 [animation-delay:240ms]">
              <Link href="/collaboration">
                <Button size="lg">
                  Start a Project
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button size="lg" variant="outline">
                  Lihat Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      {featuredServices.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeader eyebrow="Layanan" title="Apa yang kami sediakan" href="/services" />
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground" data-reveal>
            Solusi digital menyeluruh untuk bisnis Anda, mulai dari website dan sistem informasi
            hingga otomasi dan integrasi AI.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((s, i) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="card-lift group rounded-xl border border-border bg-card p-6"
                data-reveal
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <ServiceIcon slug={s.slug} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold tracking-tight group-hover:text-primary">
                  {s.name}
                </h3>
                {s.description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Selengkapnya <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Portfolio */}
      {featuredPortfolio.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeader eyebrow="Portfolio" title="Karya pilihan" href="/portfolio" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPortfolio.map((p, i) => (
              <Link
                key={p.slug}
                href={`/portfolio/${p.slug}`}
                className="card-lift group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card"
                data-reveal
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <div className="overflow-hidden">
                  {p.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnailUrl}
                      alt=""
                      className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-muted transition-transform duration-500 group-hover:scale-105">
                      <span className="text-2xl font-semibold tracking-tight text-muted-foreground/40">
                        {p.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-foreground opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                <div className="p-6">
                  <span className="text-xs text-muted-foreground">
                    {p.isConfidential ? "Confidential Project" : (p.clientName ?? "Proyek")}
                  </span>
                  <h3 className="mt-1 font-semibold tracking-tight group-hover:text-primary">
                    {p.title}
                  </h3>
                  {p.summary ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {p.summary}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Testimonials */}
      {featuredTestimonials.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeader eyebrow="Testimoni" title="Kata mereka" href="/testimonials" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTestimonials.map((t, i) => (
              <figure
                key={`${t.authorName}-${i}`}
                className="card-lift flex flex-col rounded-xl border border-border bg-card p-6"
                data-reveal
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <div className="flex items-center justify-between">
                  <Quote className="h-5 w-5 text-primary/50" aria-hidden />
                  {t.rating ? (
                    <div className="text-sm text-amber-500" aria-label={`${t.rating} dari 5`}>
                      {"★".repeat(t.rating)}
                      <span className="text-muted-foreground/40">{"★".repeat(5 - t.rating)}</span>
                    </div>
                  ) : null}
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  “{t.content}”
                </blockquote>
                <figcaption className="mt-5 text-sm font-medium">
                  {t.authorName}
                  {t.company ? (
                    <span className="font-normal text-muted-foreground"> · {t.company}</span>
                  ) : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* Articles */}
      {articles.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionHeader eyebrow="Blog" title="Artikel terbaru" href="/articles" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="card-lift group rounded-xl border border-border bg-card p-6"
                data-reveal
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {a.readingTime} mnt baca
                </span>
                <h3 className="mt-2 font-semibold tracking-tight group-hover:text-primary">
                  {a.title}
                </h3>
                {a.summary ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {a.summary}
                  </p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Baca artikel <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center sm:p-14"
          data-reveal
        >
          <div
            aria-hidden
            className="absolute left-1/2 top-[-10rem] h-[18rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]"
          />
          <div className="relative">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Siap membangun produk digital?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
              Ceritakan ide Anda, tim {SITE.name} siap mewujudkannya.
            </p>
            <Link href="/collaboration" className="mt-8 inline-block">
              <Button size="lg">
                Start a Project
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
