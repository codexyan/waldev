import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CtaPanel } from "@/components/cta-panel";
import { ProcessTimeline } from "@/components/process-timeline";
import { Eyebrow } from "@/components/ui/section-heading";
import { getPublishedPortfolioBySlug } from "@/modules/portfolio/portfolio.dal";
import { getSeoMeta } from "@/modules/seo/seo.dal";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  ongoing: "Berjalan",
  completed: "Selesai",
  archived: "Arsip",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedPortfolioBySlug(slug);
  if (!project) return { title: "Proyek tidak ditemukan" };
  const seo = await getSeoMeta("portfolio", project.id);
  const title = seo.metaTitle || project.title;
  const description = seo.metaDescription || project.summary || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/portfolio/${project.slug}` },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: { title, description },
  };
}

function Narrative({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return (
    <div className="mt-6 space-y-5">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line leading-relaxed text-muted-foreground">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-6 sm:px-8 sm:first:pl-0 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-border">
      <dt className="label-mono text-muted-foreground">{label}</dt>
      <dd className="display-sm mt-3 text-base">{value}</dd>
    </div>
  );
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublishedPortfolioBySlug(slug);
  if (!project) notFound();

  const clientLabel = project.isConfidential
    ? "Proyek rahasia"
    : (project.clientName ?? "Proyek internal");

  return (
    <>
      <header className="bg-noise relative overflow-hidden border-b border-border">
        <div aria-hidden className="bg-grid absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-10">
          <Link
            href="/portfolio"
            className="link-sweep group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Semua karya
          </Link>

          <div className="animate-fade-up mt-12 [animation-delay:80ms]">
            <Eyebrow>{clientLabel}</Eyebrow>
          </div>
          <h1 className="display animate-fade-up mt-8 max-w-4xl text-balance text-[clamp(2.25rem,6vw,4.25rem)] [animation-delay:160ms]">
            {project.title}
          </h1>
          {project.summary ? (
            <p className="animate-fade-up mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground [animation-delay:280ms]">
              {project.summary}
            </p>
          ) : null}
        </div>
      </header>

      <article className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Ringkasan fakta proyek. */}
        <dl className="grid grid-cols-2 border-b border-border sm:grid-cols-4" data-reveal>
          <MetaItem label="Klien" value={clientLabel} />
          <MetaItem label="Durasi" value={project.timeline || "Fleksibel"} />
          <MetaItem label="Status" value={STATUS_LABEL[project.status] ?? project.status} />
          <MetaItem
            label="Tautan"
            value={
              project.demoUrl || project.repoUrl ? (
                <span className="flex flex-wrap gap-4">
                  {project.demoUrl ? (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-sweep inline-flex items-center gap-1.5"
                    >
                      Demo
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ) : null}
                  {project.repoUrl ? (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-sweep inline-flex items-center gap-1.5"
                    >
                      Repositori
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ) : null}
                </span>
              ) : (
                "Tidak dipublikasikan"
              )
            }
          />
        </dl>

        {project.coverUrl ? (
          <div className="mt-14 overflow-hidden rounded-lg border border-border" data-reveal="wipe">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.coverUrl}
              alt={project.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        ) : null}

        {project.challenge || project.solution ? (
          <div className="mt-20 grid gap-14 border-t border-border pt-12 sm:grid-cols-2 sm:gap-16">
            {project.challenge ? (
              <section data-reveal>
                <Eyebrow>Tantangan</Eyebrow>
                <Narrative text={project.challenge} />
              </section>
            ) : null}
            {project.solution ? (
              <section data-reveal style={{ transitionDelay: "100ms" }}>
                <Eyebrow>Pendekatan dan solusi</Eyebrow>
                <Narrative text={project.solution} />
              </section>
            ) : null}
          </div>
        ) : null}

        {project.technologies.length > 0 ? (
          <section className="mt-20 border-t border-border pt-12" data-reveal>
            <Eyebrow>Teknologi</Eyebrow>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border px-4 py-2 text-sm transition-colors duration-300 hover:border-foreground/40"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {project.features.length > 0 ? (
          <section className="mt-20 border-t border-border pt-12">
            <div data-reveal>
              <Eyebrow>Fitur utama</Eyebrow>
              <h2 className="display mt-8 text-balance text-3xl sm:text-4xl">
                Apa saja yang dibangun
              </h2>
            </div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
              {project.features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-background p-7 transition-colors duration-500 hover:bg-muted"
                  data-reveal
                  style={{ transitionDelay: `${(index % 2) * 70}ms` }}
                >
                  <span className="label-mono text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="display-sm mt-4 text-base">{feature.title}</p>
                  {feature.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {project.gallery.length > 0 ? (
          <section className="mt-20 border-t border-border pt-12">
            <div data-reveal>
              <Eyebrow>Galeri</Eyebrow>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {project.gallery.map((image, index) => (
                <div
                  key={image.url}
                  className="group overflow-hidden rounded-lg border border-border"
                  data-reveal="wipe"
                  style={{ transitionDelay: `${(index % 2) * 90}ms` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-20 border-t border-border pt-12">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div data-reveal>
                <Eyebrow>Proses</Eyebrow>
                <h2 className="display mt-8 text-balance text-3xl sm:text-4xl">
                  Bagaimana kami mengerjakannya
                </h2>
                <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
                  Proyek ini dijalankan end to end dengan pendekatan design thinking, dari memahami
                  masalah sampai peluncuran dan penyempurnaan berkelanjutan.
                </p>
              </div>
            </div>
            <ProcessTimeline />
          </div>
        </section>
      </article>

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-20 lg:px-10">
        <CtaPanel
          title="Punya kebutuhan serupa?"
          body="Ceritakan kondisi Anda saat ini. Kami bantu wujudkan dengan proses dan standar yang sama seperti proyek ini."
        />
      </section>
    </>
  );
}
