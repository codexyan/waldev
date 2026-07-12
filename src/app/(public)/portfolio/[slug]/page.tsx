import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProcessTimeline } from "@/components/process-timeline";
import { Button } from "@/components/ui/button";
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-primary">{children}</p>
  );
}

function Narrative({ text }: { text: string }) {
  const paras = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="mt-4 space-y-4">
      {paras.map((p, i) => (
        <p key={i} className="whitespace-pre-line leading-relaxed text-muted-foreground">
          {p}
        </p>
      ))}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground/70">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
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
    ? "Confidential Project"
    : (project.clientName ?? "Proyek Internal");

  return (
    <article className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <Link
        href="/portfolio"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua proyek
      </Link>

      <header className="mt-8 max-w-3xl">
        <Eyebrow>{clientLabel}</Eyebrow>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          {project.title}
        </h1>
        {project.summary ? (
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {project.summary}
          </p>
        ) : null}
      </header>

      {/* Meta bar */}
      <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-5 border-y border-border py-6">
        <MetaItem label="Klien" value={clientLabel} />
        {project.timeline ? <MetaItem label="Durasi" value={project.timeline} /> : null}
        <MetaItem label="Status" value={STATUS_LABEL[project.status] ?? project.status} />
        {project.demoUrl || project.repoUrl ? (
          <MetaItem
            label="Tautan"
            value={
              <span className="flex flex-wrap gap-3">
                {project.demoUrl ? (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Live demo
                  </a>
                ) : null}
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Repository
                  </a>
                ) : null}
              </span>
            }
          />
        ) : null}
      </dl>

      {project.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.coverUrl}
          alt={project.title}
          className="mt-10 aspect-video w-full rounded-2xl border border-border object-cover"
        />
      ) : null}

      {/* Narrative: Challenge + Solution */}
      {project.challenge || project.solution ? (
        <div className="mt-16 grid gap-12 sm:grid-cols-2">
          {project.challenge ? (
            <section>
              <Eyebrow>Tantangan</Eyebrow>
              <Narrative text={project.challenge} />
            </section>
          ) : null}
          {project.solution ? (
            <section>
              <Eyebrow>Pendekatan &amp; Solusi</Eyebrow>
              <Narrative text={project.solution} />
            </section>
          ) : null}
        </div>
      ) : null}

      {/* Process (visual end-to-end) */}
      <section className="mt-16 overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-10">
        <Eyebrow>Proses</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Bagaimana kami mengerjakannya</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Setiap proyek dijalankan end-to-end dengan pendekatan design thinking, dari memahami
          masalah hingga peluncuran dan penyempurnaan berkelanjutan.
        </p>
        <ProcessTimeline />
      </section>

      {/* Tech stack */}
      {project.technologies.length > 0 ? (
        <section className="mt-16">
          <Eyebrow>Tech Stack</Eyebrow>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Features */}
      {project.features.length > 0 ? (
        <section className="mt-16">
          <Eyebrow>Fitur Utama</Eyebrow>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {project.features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-card p-5">
                <p className="font-semibold tracking-tight">{feature.title}</p>
                {feature.description ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {project.gallery.length > 0 ? (
        <section className="mt-16">
          <Eyebrow>Galeri</Eyebrow>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {project.gallery.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.url}
                src={img.url}
                alt={img.filename}
                className="w-full rounded-xl border border-border object-cover"
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="mt-20">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center sm:p-14">
          <div
            aria-hidden
            className="absolute left-1/2 top-[-10rem] h-[18rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]"
          />
          <div className="relative">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Punya proyek serupa?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-pretty text-muted-foreground">
              Ceritakan kebutuhan Anda, kami bantu wujudkan dengan proses yang sama.
            </p>
            <Link href="/collaboration" className="mt-7 inline-block">
              <Button size="lg">
                Start a Project
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
