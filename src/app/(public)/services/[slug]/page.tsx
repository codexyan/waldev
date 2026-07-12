import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { ServiceIcon } from "@/components/service-icon";
import { Button } from "@/components/ui/button";
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
  const ctaLabel = service.ctaLabel || "Mulai Proyek";

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua layanan
      </Link>

      <header className="mt-8" data-reveal>
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <ServiceIcon slug={service.slug} className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight">{service.name}</h1>
        {service.description ? (
          <p className="mt-4 whitespace-pre-line text-pretty text-lg leading-relaxed text-muted-foreground">
            {service.description}
          </p>
        ) : null}
      </header>

      {service.features.length > 0 ? (
        <section className="mt-14" data-reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Yang Anda dapatkan
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Fitur</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {service.features.map((f) => (
              <li key={f.title} className="card-lift flex gap-3 rounded-xl border border-border bg-card p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-medium tracking-tight">{f.title}</p>
                  {f.description ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {service.workflow.length > 0 ? (
        <section className="mt-14" data-reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Cara kami bekerja
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Workflow</h2>
          <ol className="relative mt-6 space-y-6">
            <div
              aria-hidden
              className="absolute bottom-4 left-4 top-4 w-px bg-gradient-to-b from-primary/50 via-border to-border"
            />
            {service.workflow.map((step, i) => (
              <li key={step.title} className="relative flex gap-4">
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-primary shadow-sm">
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <p className="font-medium tracking-tight">{step.title}</p>
                  {step.description ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {service.faqs.length > 0 ? (
        <section className="mt-14" data-reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Sering ditanyakan
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">FAQ</h2>
          <div className="mt-5 space-y-3">
            {service.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-border bg-card px-5 py-4 transition-colors open:border-primary/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium tracking-tight [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-16" data-reveal>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center">
          <div
            aria-hidden
            className="absolute left-1/2 top-[-9rem] h-[16rem] w-[26rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[90px]"
          />
          <div className="relative">
            <h2 className="text-balance text-2xl font-semibold tracking-tight">
              Tertarik dengan layanan ini?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
              Ceritakan kebutuhan Anda dan kami bantu wujudkan.
            </p>
            <Link href={ctaHref} className="mt-6 inline-block">
              <Button size="lg">
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
