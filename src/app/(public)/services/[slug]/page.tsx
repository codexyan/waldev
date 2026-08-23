import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { CtaPanel } from "@/components/cta-panel";
import { FaqAccordion, GENERAL_FAQS } from "@/components/faq-accordion";
import { ServiceIcon } from "@/components/service-icon";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { SECTION, SHELL } from "@/components/ui/shell";
import { cn } from "@/lib/utils";
import { WAKTU_BALAS } from "@/lib/constants";
import { WA_PESAN } from "@/lib/whatsapp";
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

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getActiveServiceBySlug(slug);
  if (!service) notFound();

  const ctaHref = service.ctaUrl || "/collaboration";
  const faqs = service.faqs.length > 0 ? service.faqs : GENERAL_FAQS;

  return (
    <>
      <header className="border-border border-b">
        <div className={cn(SHELL, "pt-8 pb-14")}>
          <ArrowLink href="/services" className="text-muted-foreground hover:text-link" back>
            Semua layanan
          </ArrowLink>

          <div className="mt-10 flex items-center gap-2">
            <ServiceIcon slug={service.slug} className="text-link h-4 w-4" />
            <Eyebrow>Layanan</Eyebrow>
          </div>

          <h1 className="display mt-4 max-w-3xl text-[2rem] text-balance sm:text-4xl lg:text-5xl">
            {service.name}
          </h1>
          {service.description ? (
            <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed text-pretty whitespace-pre-line">
              {service.description}
            </p>
          ) : null}

          {/* Harga sudah terlihat di daftar layanan, lalu hilang tepat di halaman
              tempat keputusan diambil. Angkanya sama, dari kolom CMS yang sama. */}
          {service.price ? (
            <div className="border-border bg-card mt-8 max-w-md rounded-xl border px-5 py-4">
              <p className="text-faint text-xs">Biaya</p>
              <p className="display mt-1 text-2xl tabular-nums">{service.price}</p>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                Titik awal, bukan harga mati. Biaya akhir mengikuti jumlah halaman dan fitur yang
                benar-benar Anda butuhkan, dan selalu kami kirim tertulis sebelum pekerjaan dimulai.
              </p>
            </div>
          ) : null}
        </div>
      </header>

      {service.features.length > 0 ? (
        <section className={cn(SHELL, SECTION)}>
          <SectionHeading eyebrow="Yang Anda dapatkan" title="Cakupan pekerjaan" />
          <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {service.features.map((feature) => (
              <li key={feature.title}>
                <h3 className="display-sm flex items-center gap-2 text-[0.9375rem]">
                  <Check className="text-link h-4 w-4 shrink-0" aria-hidden />
                  {feature.title}
                </h3>
                {feature.description ? (
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {service.workflow.length > 0 ? (
        <section className={cn(SHELL, SECTION, "border-border border-t")}>
          <SectionHeading
            eyebrow="Cara kami bekerja"
            title="Alur pengerjaan"
            description="Setiap tahap punya hasil yang bisa Anda lihat, jadi Anda tidak pernah menunggu dalam gelap."
          />
          <ol className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {service.workflow.map((step, index) => (
              <li key={step.title}>
                <h3 className="display-sm flex items-baseline gap-2 text-[0.9375rem]">
                  <span className="text-link font-mono text-xs">{index + 1}</span>
                  {step.title}
                </h3>
                {step.description ? (
                  <p className="text-muted-foreground mt-2 max-w-md leading-relaxed">
                    {step.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className={cn(SHELL, SECTION, "border-border border-t")}>
        <SectionHeading eyebrow="Pertanyaan" title="Sering ditanyakan" />
        <div className="mt-8">
          <FaqAccordion items={faqs} />
        </div>
      </section>

      <section className={cn(SHELL, "pt-16 pb-4 sm:pt-24")}>
        <CtaPanel
          title={`Tertarik dengan ${service.name}?`}
          body={`Ceritakan kebutuhan Anda, tidak perlu menyiapkan dokumen apa pun. Kami balas dengan cakupan dan perkiraan biaya yang jelas dalam ${WAKTU_BALAS}.`}
          ctaHref={ctaHref}
          waMessage={WA_PESAN.layanan(service.name)}
        />
      </section>
    </>
  );
}
