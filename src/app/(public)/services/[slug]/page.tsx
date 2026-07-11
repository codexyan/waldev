import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getActiveServiceBySlug } from "@/modules/services/service.dal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getActiveServiceBySlug(slug);
  if (!service) return { title: "Layanan tidak ditemukan" };
  return {
    title: service.name,
    description: service.description ?? undefined,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: service.name, description: service.description ?? undefined },
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
      <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground">
        ← Semua layanan
      </Link>

      <header className="mt-6">
        <h1 className="text-4xl font-semibold tracking-tight">{service.name}</h1>
        {service.description ? (
          <p className="mt-4 whitespace-pre-line text-lg text-muted-foreground">
            {service.description}
          </p>
        ) : null}
        {service.price ? <p className="mt-4 text-sm font-medium">{service.price}</p> : null}
      </header>

      {service.features.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Fitur</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {service.features.map((f) => (
              <li key={f.title} className="rounded-lg border border-border p-4">
                <p className="font-medium">{f.title}</p>
                {f.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {service.workflow.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Workflow</h2>
          <ol className="mt-4 space-y-4">
            {service.workflow.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{step.title}</p>
                  {step.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {service.faqs.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">FAQ</h2>
          <div className="mt-4 space-y-4">
            {service.faqs.map((faq) => (
              <div key={faq.question} className="rounded-lg border border-border p-4">
                <p className="font-medium">{faq.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14 rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold tracking-tight">Tertarik dengan layanan ini?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ceritakan kebutuhan Anda dan kami bantu wujudkan.
        </p>
        <Link href={ctaHref} className="mt-6 inline-block">
          <Button size="lg">{ctaLabel}</Button>
        </Link>
      </section>
    </article>
  );
}
