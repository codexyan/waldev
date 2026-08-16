import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaPanel } from "@/components/cta-panel";
import { FaqAccordion, GENERAL_FAQS } from "@/components/faq-accordion";
import { Hero, type HeroStat } from "@/components/home/hero";
import { ServiceRows } from "@/components/home/service-rows";
import { ValueGrid } from "@/components/home/value-grid";
import { Marquee } from "@/components/motion/marquee";
import { ProcessTimeline } from "@/components/process-timeline";
import { ProjectCard } from "@/components/project-card";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { CAPABILITIES, SITE } from "@/lib/constants";
import { listPublishedArticles } from "@/modules/articles/article.dal";
import { listPublishedPortfolios } from "@/modules/portfolio/portfolio.dal";
import { listActiveServices } from "@/modules/services/service.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";
import { listPublishedTestimonials } from "@/modules/testimonials/testimonial.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const SECTION = "mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-10";

export default async function HomePage() {
  const [settings, services, portfolios, articlesResult, testimonials] = await Promise.all([
    getSiteSettings(),
    listActiveServices(),
    listPublishedPortfolios(),
    listPublishedArticles({ limit: 3 }),
    listPublishedTestimonials(),
  ]);

  const articles = articlesResult.rows;
  const featuredServices = services.slice(0, 6);
  const featuredPortfolio = portfolios.slice(0, 3);
  const featuredTestimonials = testimonials.slice(0, 3);

  // Angka diambil dari isi CMS supaya selalu jujur, bukan klaim hafalan.
  const stats: HeroStat[] = [
    { value: portfolios.length, label: "Proyek dipublikasikan" },
    { value: services.length, label: "Bidang layanan" },
    { value: 5, label: "Tahap proses kerja" },
    { value: "1x24", label: "Jam waktu respons" },
  ];

  return (
    <>
      <Hero description={settings.description || SITE.description} stats={stats} />

      {/* Pita kapabilitas yang berjalan pelan. */}
      <section className="border-y border-border py-7">
        <Marquee items={CAPABILITIES} />
      </section>

      {featuredServices.length > 0 ? (
        <section className={SECTION}>
          <SectionHeading
            index="01"
            eyebrow="Layanan"
            title="Yang bisa kami kerjakan untuk Anda"
            description="Dari halaman perkenalan sederhana sampai sistem informasi yang dipakai puluhan staf setiap hari. Semuanya dibangun end to end oleh tim yang sama."
            href="/services"
            linkLabel="Semua layanan"
          />
          <div className="mt-14">
            <ServiceRows services={featuredServices} />
          </div>
        </section>
      ) : null}

      {featuredPortfolio.length > 0 ? (
        <section className={SECTION}>
          <SectionHeading
            index="02"
            eyebrow="Karya"
            title="Proyek terpilih"
            description="Setiap proyek punya cerita: masalah yang dipecahkan, keputusan desain yang diambil, dan hasil yang dirasakan penggunanya."
            href="/portfolio"
            linkLabel="Semua karya"
          />
          <div className="mt-14 grid gap-14 sm:grid-cols-2">
            {featuredPortfolio.map((project, index) => (
              <div key={project.slug} className={index === 0 ? "sm:col-span-2" : undefined}>
                <ProjectCard
                  item={project}
                  index={index}
                  wide={index === 0}
                  delay={(index % 2) * 90}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Proses: kolom kiri menempel, kolom kanan bergulir. */}
      <section className={SECTION}>
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="border-t border-border pt-6" data-reveal>
              <div className="flex items-start justify-between gap-6">
                <Eyebrow>Proses</Eyebrow>
                <span className="label-mono text-muted-foreground">03</span>
              </div>
              <h2 className="display mt-8 text-balance text-3xl sm:text-4xl lg:text-[2.75rem]">
                Cara kami bekerja
              </h2>
              <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
                Kami memakai pendekatan design thinking. Solusi tidak berangkat dari asumsi,
                melainkan dari pemahaman atas pengguna dan tujuan bisnis Anda, lalu diuji dan
                disempurnakan bertahap.
              </p>
              <Link
                href="/about"
                className="link-sweep group mt-8 inline-flex items-center gap-2 text-sm font-medium"
              >
                Kenali tim kami
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <ProcessTimeline />
        </div>
      </section>

      <section className={SECTION}>
        <SectionHeading
          index="04"
          eyebrow="Kenapa WalDev"
          title="Alasan klien bertahan bersama kami"
          description="Bukan sekadar situs yang enak dilihat, tetapi produk yang mudah dirawat dan tumbuh bersama bisnis Anda."
        />
        <div className="mt-14">
          <ValueGrid />
        </div>
      </section>

      {featuredTestimonials.length > 0 ? (
        <section className={SECTION}>
          <SectionHeading
            index="05"
            eyebrow="Testimoni"
            title="Kata mereka yang sudah bekerja sama"
            href="/testimonials"
            linkLabel="Semua testimoni"
          />
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTestimonials.map((testimonial, index) => (
              <figure
                key={`${testimonial.authorName}-${index}`}
                className="flex flex-col justify-between border-t border-border pt-7"
                data-reveal
                style={{ transitionDelay: `${(index % 3) * 80}ms` }}
              >
                <div>
                  {testimonial.rating ? (
                    <div
                      className="flex gap-1"
                      aria-label={`Nilai ${testimonial.rating} dari 5`}
                    >
                      {Array.from({ length: 5 }).map((_, star) => (
                        <span
                          key={star}
                          aria-hidden
                          className={
                            star < (testimonial.rating ?? 0)
                              ? "h-1.5 w-6 bg-signal"
                              : "h-1.5 w-6 bg-border"
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                  <blockquote className="display-sm mt-6 text-balance text-lg leading-snug">
                    “{testimonial.content}”
                  </blockquote>
                </div>
                <figcaption className="mt-8 flex items-center gap-3">
                  {testimonial.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={testimonial.photoUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-sm font-medium">
                      {testimonial.authorName.charAt(0)}
                    </span>
                  )}
                  <span>
                    <span className="block text-sm font-medium">{testimonial.authorName}</span>
                    <span className="label-mono mt-1 block text-muted-foreground">
                      {[testimonial.authorRole, testimonial.company].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {articles.length > 0 ? (
        <section className={SECTION}>
          <SectionHeading
            index="06"
            eyebrow="Jurnal"
            title="Catatan dan wawasan terbaru"
            href="/articles"
            linkLabel="Semua tulisan"
          />
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group flex flex-col border-t border-border pt-7"
                data-reveal
                style={{ transitionDelay: `${(index % 3) * 80}ms` }}
              >
                <span className="label-mono flex items-center gap-2.5 text-muted-foreground">
                  {article.categoryName ? <span>{article.categoryName}</span> : null}
                  {article.categoryName ? <span aria-hidden>·</span> : null}
                  <span>{article.readingTime} menit</span>
                </span>
                <h3 className="display-sm mt-5 text-balance text-xl">{article.title}</h3>
                {article.summary ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {article.summary}
                  </p>
                ) : null}
                <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium">
                  <span className="link-sweep">Baca tulisan</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className={SECTION}>
        <SectionHeading
          index="07"
          eyebrow="Pertanyaan"
          title="Hal yang paling sering ditanyakan"
          description="Belum terjawab? Kirim pertanyaan Anda lewat halaman kontak, kami balas dengan bahasa yang mudah dipahami."
        />
        <div className="mt-14">
          <FaqAccordion items={GENERAL_FAQS} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-10">
        <CtaPanel
          title="Ceritakan idenya, sisanya kami yang susun."
          body="Isi brief terpandu selama tiga menit. Jawaban Anda otomatis menjadi dokumen kebutuhan, dan tim kami menghubungi dalam 1x24 jam kerja."
        />
      </section>
    </>
  );
}
