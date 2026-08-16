import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { CtaPanel } from "@/components/cta-panel";
import { FaqAccordion, GENERAL_FAQS } from "@/components/faq-accordion";
import { ServiceIcon } from "@/components/service-icon";
import { Eyebrow } from "@/components/ui/section-heading";
import { getActiveServiceBySlug } from "@/modules/services/service.dal";
import { getSeoMeta } from "@/modules/seo/seo.dal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getActiveServiceBySlug(slug);
  if (!service) return { title: "Layanan tidak ditemukan" };
  const seo = await getSeoMeta("service", service.id);
  const title = seo.metaTitle || service.name;
  const description = seo.metaDescription || service.description || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/services/${service.slug}` },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: { title, description },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getActiveServiceBySlug(slug);
  if (!service) notFound();

  const ctaHref = service.ctaUrl || "/collaboration";
  const ctaLabel = service.ctaLabel || "Mulai proyek";
  const faqs = service.faqs.length > 0 ? service.faqs : GENERAL_FAQS;

  return (
    <>
      <header className="bg-noise relative overflow-hidden border-b border-border">
        <div aria-hidden className="bg-grid absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-10">
          <Link
            href="/services"
            className="link-sweep group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Semua layanan
          </Link>

          <div className="animate-fade-up mt-12 flex items-center gap-4 [animation-delay:80ms]">
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-signal text-signal-foreground">
              <ServiceIcon slug={service.slug} className="h-6 w-6" />
            </span>
            <Eyebrow>Layanan</Eyebrow>
          </div>

          <h1 className="display animate-fade-up mt-8 max-w-4xl text-balance text-[clamp(2.25rem,6vw,4.25rem)] [animation-delay:160ms]">
            {service.name}
          </h1>
          {service.description ? (
            <p className="animate-fade-up mt-7 max-w-2xl whitespace-pre-line text-pretty text-lg leading-relaxed text-muted-foreground [animation-delay:280ms]">
              {service.description}
            </p>
          ) : null}
        </div>
      </header>

      {service.features.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-10">
          <div className="border-t border-border pt-6" data-reveal>
            <div className="flex items-start justify-between gap-6">
              <Eyebrow>Yang Anda dapatkan</Eyebrow>
              <span className="label-mono text-muted-foreground">01</span>
            </div>
            <h2 className="display mt-8 text-balance text-3xl sm:text-4xl">Cakupan pekerjaan</h2>
          </div>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {service.features.map((feature, index) => (
              <li
                key={feature.title}
                className="group flex gap-4 bg-background p-7 transition-colors duration-500 hover:bg-muted"
                data-reveal
                style={{ transitionDelay: `${(index % 2) * 70}ms` }}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-500 group-hover:border-transparent group-hover:bg-signal group-hover:text-signal-foreground">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div>
                  <p className="display-sm text-base">{feature.title}</p>
                  {feature.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {service.workflow.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 pb-16 sm:pb-24 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="border-t border-border pt-6" data-reveal>
                <div className="flex items-start justify-between gap-6">
                  <Eyebrow>Cara kami bekerja</Eyebrow>
                  <span className="label-mono text-muted-foreground">02</span>
                </div>
                <h2 className="display mt-8 text-balance text-3xl sm:text-4xl">
                  Alur pengerjaan
                </h2>
                <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
                  Setiap tahap punya hasil yang bisa Anda lihat, jadi Anda tidak pernah menunggu
                  dalam gelap.
                </p>
              </div>
            </div>
            <ol className="relative">
              <div aria-hidden className="absolute bottom-8 left-6 top-8 w-px bg-border" />
              <div aria-hidden className="progress-line absolute bottom-8 left-6 top-8 w-px" />
              {service.workflow.map((step, index) => (
                <li
                  key={step.title}
                  className="relative flex gap-6"
                  data-reveal
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <span className="label-mono relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="pb-10 pt-3">
                    <h3 className="display-sm text-lg">{step.title}</h3>
                    {step.description ? (
                      <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-6 pb-16 sm:pb-24 lg:px-10">
        <div className="border-t border-border pt-6" data-reveal>
          <div className="flex items-start justify-between gap-6">
            <Eyebrow>Pertanyaan</Eyebrow>
            <span className="label-mono text-muted-foreground">03</span>
          </div>
          <h2 className="display mt-8 text-balance text-3xl sm:text-4xl">Sering ditanyakan</h2>
        </div>
        <div className="mt-12">
          <FaqAccordion items={faqs} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-10">
        <CtaPanel
          title={`Tertarik dengan ${service.name}?`}
          body="Ceritakan kebutuhan Anda lewat brief terpandu. Kami balas dengan cakupan dan estimasi yang jelas dalam 1x24 jam kerja."
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
        />
      </section>
    </>
  );
}
