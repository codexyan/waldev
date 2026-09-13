import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ExternalLink } from "lucide-react";
import { FaqAccordion } from "@/components/faq-accordion";
import { ArrowLink } from "@/components/ui/arrow-link";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/section-heading";
import { SHELL } from "@/components/ui/shell";
import { StaticLink } from "@/components/ui/static-link";
import { YoutubeFacade } from "@/components/youtube-facade";
import { SITE } from "@/lib/constants";
import { formatDay, formatMonthYear } from "@/lib/date";
import { cn } from "@/lib/utils";
import { getYoutubeId } from "@/lib/youtube";
import { getPublishedAppBySlug } from "@/modules/apps/app.dal";
import { AppLogo } from "@/modules/apps/components/app-card";
import { AppStatusText } from "@/modules/apps/components/app-status";
import { getSeoMeta } from "@/modules/seo/seo.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

/* generateMetadata dan halaman membaca aplikasi yang sama; cache() membuatnya
   cukup sekali per permintaan. */
const getApp = cache(getPublishedAppBySlug);

/** HTML dari Tiptap bisa berupa "<p></p>" walau isinya kosong. */
function hasText(html: string | null): boolean {
  return Boolean(html && html.replace(/<[^>]*>/g, "").trim());
}

/* Tailwind tidak memindai kelas yang dirangkai saat runtime, jadi jumlah
   kolomnya dipetakan sebagai kelas statis. */
const KOLOM_META: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = await getApp(slug);
  if (!app) return { title: "Aplikasi tidak ditemukan" };
  const seo = await getSeoMeta("app", app.id);
  const title = seo.metaTitle || app.name;
  const description = seo.metaDescription || app.tagline || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/apps/${app.slug}` },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      ...(app.coverUrl ? { images: [{ url: app.coverUrl }] } : {}),
    },
  };
}

function SectionBlock({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="border-border mt-20 border-t pt-12">
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [app, settings] = await Promise.all([getApp(slug), getSiteSettings()]);
  if (!app) notFound();

  const retired = app.status === "retired";
  // Tautan aplikasi yang sudah pensiun hampir pasti mati; halaman tetap berdiri tanpanya.
  const openHref = retired ? null : app.appUrl;
  const videoId = app.videoUrl ? getYoutubeId(app.videoUrl) : null;

  const meta: { label: string; value: string }[] = [];
  if (app.startedAt) meta.push({ label: "Mulai dibangun", value: formatMonthYear(app.startedAt) });
  if (app.releasedAt) meta.push({ label: "Dirilis", value: formatMonthYear(app.releasedAt) });
  if (app.retiredAt) meta.push({ label: "Tidak aktif sejak", value: formatMonthYear(app.retiredAt) });
  meta.push({
    label: "Catatan terakhir",
    value: app.lastActivityAt ? formatDay(app.lastActivityAt) : "Belum ada",
  });

  const showGuide = app.showGuide && hasText(app.guideHtml);
  const showFaq = app.showFaq && app.faqs.length > 0;
  const showReleases = app.showReleases && app.releases.length > 0;
  const showTimeline = app.showNotes && app.timeline.length > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.name,
    ...(app.tagline ? { description: app.tagline } : {}),
    url: new URL(`/apps/${app.slug}`, SITE.url).toString(),
    operatingSystem: "Web",
    ...(app.coverUrl ? { image: new URL(app.coverUrl, SITE.url).toString() } : {}),
    ...(app.releasedAt ? { datePublished: app.releasedAt.toISOString() } : {}),
    author: settings.owner_name
      ? { "@type": "Person", name: settings.owner_name }
      : { "@type": "Organization", name: settings.brand_name || SITE.name },
  };

  return (
    <>
      <header className="border-border border-b">
        <div className={cn(SHELL, "pt-8 pb-14")}>
          <ArrowLink href="/" className="text-muted-foreground hover:text-link" back>
            Semua aplikasi
          </ArrowLink>

          <div className="mt-10 flex items-center gap-5">
            {app.logoUrl ? (
              <AppLogo
                name={app.name}
                logoUrl={app.logoUrl}
                className="h-16 w-16 sm:h-20 sm:w-20"
              />
            ) : null}
            <div className="min-w-0">
              <p className="label">
                <AppStatusText status={app.status} />
              </p>
              <h1 className="display mt-3 max-w-3xl text-[2rem] text-balance sm:text-4xl lg:text-5xl">
                {app.name}
              </h1>
            </div>
          </div>
          {app.tagline ? (
            <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed text-pretty">
              {app.tagline}
            </p>
          ) : null}

          {retired ? (
            <p className="border-border bg-surface text-muted-foreground mt-8 max-w-2xl rounded-lg border px-4 py-3 leading-relaxed">
              Aplikasi ini sudah tidak aktif
              {app.retiredAt ? ` sejak ${formatMonthYear(app.retiredAt)}` : ""}. Halaman ini tetap
              ada sebagai dokumentasi.
            </p>
          ) : null}

          {openHref || app.repoUrl ? (
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {openHref ? (
                <a
                  href={openHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: "lg" }), "gap-2")}
                >
                  Buka aplikasi
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
              {app.repoUrl ? (
                <ArrowLink href={app.repoUrl} external>
                  Lihat kode sumber
                </ArrowLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-6">
        <dl className={cn("border-border grid grid-cols-2 border-b", KOLOM_META[meta.length])}>
          {meta.map((item) => (
            <div
              key={item.label}
              className="sm:[&:not(:first-child)]:border-border py-5 sm:px-6 sm:first:pl-0 sm:[&:not(:first-child)]:border-l"
            >
              <dt className="text-faint text-xs">{item.label}</dt>
              <dd className="display-sm mt-1.5 text-[0.9375rem]">{item.value}</dd>
            </div>
          ))}
        </dl>

        {app.coverUrl ? (
          <div className="border-border bg-surface mt-12 overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={app.coverUrl}
              alt={app.coverAlt || `Tangkapan layar ${app.name}`}
              className="w-full object-cover"
            />
          </div>
        ) : null}

        {videoId ? (
          <div className="border-border bg-surface mt-8 overflow-hidden rounded-xl border">
            <YoutubeFacade videoId={videoId} title={`Video ${app.name}`} />
          </div>
        ) : null}

        {hasText(app.descriptionHtml) ? (
          <div
            className="prose mt-16 max-w-3xl"
            dangerouslySetInnerHTML={{ __html: app.descriptionHtml ?? "" }}
          />
        ) : null}

        {app.features.length > 0 ? (
          <SectionBlock eyebrow="Fitur utama">
            <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {app.features.map((feature, index) => (
                <li key={`${index}-${feature.title}`}>
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
          </SectionBlock>
        ) : null}

        {app.gallery.length > 0 ? (
          <SectionBlock eyebrow="Galeri">
            <div className="grid gap-6 sm:grid-cols-2">
              {app.gallery.map((image) => (
                <figure key={image.url} className="space-y-2">
                  <div className="border-border bg-surface overflow-hidden rounded-xl border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.alt || image.caption || image.filename}
                      loading="lazy"
                      decoding="async"
                      className="w-full object-cover"
                    />
                  </div>
                  {image.caption ? (
                    <figcaption className="text-faint text-xs">{image.caption}</figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </SectionBlock>
        ) : null}

        {app.technologies.length > 0 ? (
          <SectionBlock eyebrow="Dibangun dengan">
            <div className="flex flex-wrap gap-2.5">
              {app.technologies.map((tech) => (
                <span
                  key={tech}
                  className="border-border bg-card rounded-md border px-2.5 py-1 text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </SectionBlock>
        ) : null}

        {showGuide ? (
          <SectionBlock eyebrow="Cara pakai">
            <div
              className="prose max-w-3xl"
              dangerouslySetInnerHTML={{ __html: app.guideHtml ?? "" }}
            />
          </SectionBlock>
        ) : null}

        {showFaq ? (
          <SectionBlock eyebrow="Pertanyaan umum">
            <FaqAccordion items={app.faqs} />
          </SectionBlock>
        ) : null}

        {showReleases ? (
          <SectionBlock eyebrow="Catatan rilis">
            <ol className="space-y-8">
              {app.releases.map((release) => (
                <li key={release.id} className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-8">
                  <div>
                    <p className="display-sm text-[0.9375rem]">{release.version}</p>
                    <p className="text-faint mt-1 text-xs">{formatDay(release.notedAt)}</p>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {release.body}
                  </p>
                </li>
              ))}
            </ol>
          </SectionBlock>
        ) : null}

        {showTimeline ? (
          <SectionBlock eyebrow="Catatan pembuatan">
            <ol className="border-border border-l">
              {app.timeline.map((entry) => (
                <li
                  key={entry.kind === "note" ? entry.id : `artikel-${entry.slug}`}
                  className="relative pb-8 pl-6 last:pb-0"
                >
                  <span
                    aria-hidden
                    className="bg-border absolute top-1.5 -left-[3.5px] h-1.5 w-1.5 rounded-full"
                  />
                  <p className="text-faint text-xs">
                    {formatDay(entry.date)}
                    {entry.kind === "note" && entry.version ? ` · ${entry.version}` : ""}
                    {entry.kind === "article" ? " · Tulisan" : ""}
                  </p>
                  {entry.kind === "note" ? (
                    <p className="text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-line">
                      {entry.body}
                    </p>
                  ) : (
                    <StaticLink href={`/articles/${entry.slug}`} className="group mt-1.5 block">
                      <span className="display-sm group-hover:text-link text-[0.9375rem] transition-colors">
                        {entry.title}
                      </span>
                      {entry.summary ? (
                        <span className="text-muted-foreground mt-1 block leading-relaxed">
                          {entry.summary}
                        </span>
                      ) : null}
                    </StaticLink>
                  )}
                </li>
              ))}
            </ol>
          </SectionBlock>
        ) : null}
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
