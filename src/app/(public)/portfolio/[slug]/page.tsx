import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { CtaPanel } from "@/components/cta-panel";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Eyebrow } from "@/components/ui/section-heading";
import { SHELL } from "@/components/ui/shell";
import { cn } from "@/lib/utils";
import { WA_PESAN } from "@/lib/whatsapp";
import {
  getPublishedPortfolioBySlug,
  listPublishedPortfolios,
} from "@/modules/portfolio/portfolio.dal";
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

function Narrative({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return (
    <div className="mt-6 space-y-5">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="sm:[&:not(:first-child)]:border-border py-5 sm:px-6 sm:first:pl-0 sm:[&:not(:first-child)]:border-l">
      <dt className="text-faint text-xs">{label}</dt>
      <dd className="display-sm mt-1.5 text-[0.9375rem]">{value}</dd>
    </div>
  );
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, semuaKarya] = await Promise.all([
    getPublishedPortfolioBySlug(slug),
    listPublishedPortfolios(),
  ]);
  if (!project) notFound();

  /* Dengan hanya beberapa studi kasus, membaca yang berikutnya adalah cara
     termurah menaikkan keyakinan sebelum menghubungi. Tanpa ini satu-satunya
     jalan keluar selain CTA ada di puncak halaman. */
  const posisi = semuaKarya.findIndex((item) => item.slug === slug);
  const sebelumnya = posisi > 0 ? semuaKarya[posisi - 1] : undefined;
  const berikutnya = posisi >= 0 ? semuaKarya[posisi + 1] : undefined;

  /* Tanpa nama klien, label "Proyek internal" terbaca sebagai "ini cuma latihan
     mereka sendiri" — dan tampil dua kali di halaman yang sama. Lebih baik tidak
     menampilkan apa pun, sama seperti kartu di daftar karya. */
  const clientLabel = project.isConfidential ? "Proyek rahasia" : project.clientName;

  /* Menandai proyek rahasia tidak ada gunanya bila tautan ke situs live klien
     tetap tayang di sel sebelahnya. Repositori sengaja tidak pernah dirender di
     rute publik: kolomnya tetap ada di CMS sebagai catatan internal. */
  const demoHref = project.isConfidential ? null : project.demoUrl;

  const meta: { label: string; value: React.ReactNode }[] = [];
  if (clientLabel) meta.push({ label: "Klien", value: clientLabel });
  if (project.timeline) meta.push({ label: "Durasi", value: project.timeline });
  if (project.status === "ongoing") meta.push({ label: "Status", value: "Sedang berjalan" });
  if (demoHref) {
    meta.push({
      label: "Situs",
      value: (
        <a
          href={demoHref}
          target="_blank"
          rel="noopener noreferrer"
          className="link inline-flex items-center gap-1.5"
        >
          Lihat situsnya
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      ),
    });
  }

  /* Tailwind tidak memindai kelas yang dirangkai saat runtime, jadi jumlah
     kolomnya dipetakan sebagai kelas statis. */
  const KOLOM_META: Record<number, string> = {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
  };

  return (
    <>
      <header className="border-border border-b">
        <div className={cn(SHELL, "pt-8 pb-14")}>
          <ArrowLink href="/portfolio" className="text-muted-foreground hover:text-link" back>
            Semua karya
          </ArrowLink>

          {clientLabel ? <Eyebrow className="mt-10">{clientLabel}</Eyebrow> : null}
          <h1
            className={cn(
              "display max-w-3xl text-[2rem] text-balance sm:text-4xl lg:text-5xl",
              /* Tanpa eyebrow, judul mengambil alih jaraknya. */
              clientLabel ? "mt-4" : "mt-10",
            )}
          >
            {project.title}
          </h1>
          {project.summary ? (
            <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed text-pretty">
              {project.summary}
            </p>
          ) : null}
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-6">
        {/* Ringkasan fakta proyek. */}
        {meta.length > 0 ? (
          <dl className={cn("border-border grid grid-cols-2 border-b", KOLOM_META[meta.length])}>
            {meta.map((item) => (
              <MetaItem key={item.label} label={item.label} value={item.value} />
            ))}
          </dl>
        ) : null}

        {project.coverUrl ? (
          <div className="border-border bg-surface mt-12 overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.coverUrl}
              alt={project.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        ) : null}

        {project.challenge || project.solution ? (
          <div className="border-border mt-20 grid gap-14 border-t pt-12 sm:grid-cols-2 sm:gap-16">
            {project.challenge ? (
              <section>
                <Eyebrow>Tantangan</Eyebrow>
                <Narrative text={project.challenge} />
              </section>
            ) : null}
            {project.solution ? (
              <section>
                <Eyebrow>Pendekatan dan solusi</Eyebrow>
                <Narrative text={project.solution} />
              </section>
            ) : null}
          </div>
        ) : null}

        {project.technologies.length > 0 ? (
          <section className="border-border mt-20 border-t pt-12">
            <Eyebrow>Teknologi</Eyebrow>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="border-border bg-card rounded-md border px-2.5 py-1 text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {project.features.length > 0 ? (
          <section className="border-border mt-20 border-t pt-12">
            <div>
              <Eyebrow>Fitur utama</Eyebrow>
              <h2 className="display mt-3 text-2xl text-balance sm:text-[1.75rem]">
                Apa saja yang dibangun
              </h2>
            </div>
            <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {project.features.map((feature, index) => (
                <li key={feature.title}>
                  <h3 className="display-sm flex items-baseline gap-2 text-[0.9375rem]">
                    <span className="text-link font-mono text-xs">{index + 1}</span>
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

        {project.gallery.length > 0 ? (
          <section className="border-border mt-20 border-t pt-12">
            <div>
              <Eyebrow>Galeri</Eyebrow>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {project.gallery.map((image) => (
                <div
                  key={image.url}
                  className="border-border bg-surface overflow-hidden rounded-xl border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={image.filename} className="w-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      {sebelumnya || berikutnya ? (
        <nav
          aria-label="Karya lainnya"
          className="border-border mx-auto mt-16 max-w-5xl border-t px-6"
        >
          <div className="divide-border grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {sebelumnya ? (
              <Link href={`/portfolio/${sebelumnya.slug}`} className="group py-8 sm:pr-8">
                <span className="text-faint text-xs">Sebelumnya</span>
                <span className="display-sm group-hover:text-link mt-2 block text-base transition-colors">
                  {sebelumnya.title}
                </span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {berikutnya ? (
              <Link
                href={`/portfolio/${berikutnya.slug}`}
                className="group py-8 sm:pl-8 sm:text-right"
              >
                <span className="text-faint text-xs">Berikutnya</span>
                <span className="display-sm group-hover:text-link mt-2 block text-base transition-colors">
                  {berikutnya.title}
                </span>
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-4 sm:pt-24">
        <CtaPanel
          title="Punya kebutuhan serupa?"
          body="Ceritakan kondisi Anda saat ini. Kami bantu wujudkan dengan proses dan standar yang sama seperti proyek ini."
          waMessage={WA_PESAN.karya(project.title)}
        />
      </section>
    </>
  );
}
