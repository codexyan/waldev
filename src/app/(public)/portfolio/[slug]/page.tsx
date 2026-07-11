import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPortfolioBySlug } from "@/modules/portfolio/portfolio.dal";
import { getSeoMeta } from "@/modules/seo/seo.dal";

export const dynamic = "force-dynamic";

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

function Prose({ text }: { text: string }) {
  return <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{text}</p>;
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublishedPortfolioBySlug(slug);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <Link href="/portfolio" className="text-sm text-muted-foreground hover:text-foreground">
        ← Semua proyek
      </Link>

      <header className="mt-6">
        <span className="text-sm text-muted-foreground">
          {project.isConfidential ? "Confidential Project" : (project.clientName ?? "Proyek")}
        </span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{project.title}</h1>
        {project.summary ? (
          <p className="mt-4 text-lg text-muted-foreground">{project.summary}</p>
        ) : null}
      </header>

      {project.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.coverUrl}
          alt={project.title}
          className="mt-8 aspect-video w-full rounded-xl object-cover"
        />
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        {project.timeline ? (
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {project.timeline}
          </span>
        ) : null}
        {project.demoUrl ? (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
          >
            Live demo →
          </a>
        ) : null}
        {project.repoUrl ? (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
          >
            Repository →
          </a>
        ) : null}
      </div>

      {project.technologies.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Tech stack
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span key={tech} className="rounded-md bg-muted px-2.5 py-1 text-xs">
                {tech}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {project.challenge ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">Challenge</h2>
          <div className="mt-3">
            <Prose text={project.challenge} />
          </div>
        </section>
      ) : null}

      {project.solution ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight">Solution</h2>
          <div className="mt-3">
            <Prose text={project.solution} />
          </div>
        </section>
      ) : null}

      {project.features.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">Features</h2>
          <ul className="mt-4 space-y-3">
            {project.features.map((feature) => (
              <li key={feature.title} className="rounded-lg border border-border p-4">
                <p className="font-medium">{feature.title}</p>
                {feature.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {project.gallery.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Galeri</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {project.gallery.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.url}
                src={img.url}
                alt={img.filename}
                className="w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
