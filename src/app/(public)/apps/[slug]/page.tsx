import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ExternalLink } from "lucide-react";
import { ContactCta } from "@/components/contact-cta";
import { FaqAccordion } from "@/components/faq-accordion";
import { ArrowLink } from "@/components/ui/arrow-link";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { SECTION, SHELL } from "@/components/ui/shell";
import { SplitSection } from "@/components/ui/split-section";
import { StaticLink } from "@/components/ui/static-link";
import { YoutubeFacade } from "@/components/youtube-facade";
import { SITE } from "@/lib/constants";
import { formatDay, formatMonthYear } from "@/lib/date";
import { cn } from "@/lib/utils";
import { getYoutubeId } from "@/lib/youtube";
import { getPublishedAppBySlug, listPublishedApps } from "@/modules/apps/app.dal";
import { AppCard, AppLogo } from "@/modules/apps/components/app-card";
import { AppStatusText } from "@/modules/apps/components/app-status";
import { getSeoMeta } from "@/modules/seo/seo.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

/* generateMetadata dan halaman membaca proyek yang sama; cache() membuatnya
   cukup sekali per permintaan. */
const getApp = cache(getPublishedAppBySlug);

/** HTML dari Tiptap bisa berupa "<p></p>" walau isinya kosong. */
function hasText(html: string | null): boolean {
  return Boolean(html && html.replace(/<[^>]*>/g, "").trim());
}

/** "https://www.iaundang.online/" jadi "iaundang.online". */
function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/* Tailwind tidak memindai kelas yang dirangkai saat runtime, jadi jumlah
   kolom ringkasan dipetakan sebagai kelas statis. */
const KOLOM_FAKTA: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
  6: "sm:grid-cols-3 lg:grid-cols-6",
  7: "sm:grid-cols-3 lg:grid-cols-4",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = await getApp(slug);
  if (!app) return { title: "Proyek tidak ditemukan" };
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

/**
 * Halaman proyek (docs/09 §5.2), susunan "Kepala terbelah": nama, status, dan tombol di
 * kiri, tangkapan layar berbingkai di kanan, lalu ringkasan fakta, penjelasan, bagian
 * bernomor, proyek lain, dan ajakan kontak.
 */
export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [app, settings, published] = await Promise.all([
    getApp(slug),
    getSiteSettings(),
    listPublishedApps(),
  ]);
  if (!app) notFound();

  const retired = app.status === "retired";
  // Tautan situs proyek yang sudah tidak aktif hampir pasti mati; halaman tetap berdiri tanpanya.
  const openHref = retired ? null : app.appUrl;
  const videoId = app.videoUrl ? getYoutubeId(app.videoUrl) : null;
  const hasDescription = hasText(app.descriptionHtml);
  const others = published.filter((item) => item.slug !== app.slug).slice(0, 3);
  const [onlyOther] = others;

  // Ringkasan hanya memuat fakta yang datanya ada, supaya tidak ada sel "Belum ada".
  const facts: { label: string; value: React.ReactNode }[] = [
    { label: "Status", value: <AppStatusText status={app.status} /> },
  ];
  if (app.startedAt) facts.push({ label: "Mulai dibangun", value: formatMonthYear(app.startedAt) });
  if (app.releasedAt) facts.push({ label: "Dirilis", value: formatMonthYear(app.releasedAt) });
  if (app.retiredAt) facts.push({ label: "Tidak aktif sejak", value: formatMonthYear(app.retiredAt) });
  if (app.technologies.length > 0) {
    facts.push({ label: "Teknologi", value: app.technologies.join(", ") });
  }
  if (openHref) {
    facts.push({
      label: "Situs",
      value: (
        <a
          href={openHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link hover:text-link-hover break-all"
        >
          {hostname(openHref)}
        </a>
      ),
    });
  }
  if (app.lastActivityAt) {
    facts.push({ label: "Catatan terakhir", value: formatDay(app.lastActivityAt) });
  }

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
        <div className={cn(SHELL, "pt-8 pb-14 sm:pb-16")}>
          <ArrowLink href="/apps" className="text-muted-foreground hover:text-link" back>
            Semua proyek
          </ArrowLink>

          <div
            className={cn(
              "mt-10 grid gap-10",
              app.coverUrl && "lg:grid-cols-12 lg:items-center lg:gap-12",
            )}
          >
            <div className={cn("min-w-0", app.coverUrl && "lg:col-span-5")}>
              <div className="flex items-center gap-4">
                <AppLogo
                  name={app.name}
                  logoUrl={app.logoUrl}
                  className="h-14 w-14 sm:h-16 sm:w-16"
                  monogramClassName="text-[1.125rem] sm:text-[1.375rem]"
                />
                <p className="label">
                  <AppStatusText status={app.status} />
                </p>
              </div>
              <h1 className="display mt-6 text-[2rem] text-balance sm:text-4xl lg:text-5xl">
                {app.name}
              </h1>
              {app.tagline ? (
                <p className="text-muted-foreground mt-5 max-w-xl leading-relaxed text-pretty">
                  {app.tagline}
                </p>
              ) : null}

              {retired ? (
                <p className="border-border bg-surface text-muted-foreground mt-6 max-w-xl rounded-lg border px-4 py-3 leading-relaxed">
                  Proyek ini sudah tidak aktif
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
                      className={cn(buttonVariants({ size: "lg" }), "w-full gap-2 sm:w-auto")}
                    >
                      Kunjungi situs
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

            {app.coverUrl ? (
              <div className="min-w-0 lg:col-span-7">
                {/* Bingkai bermotif Cetak biru, sama dengan lantai hero beranda. */}
                <div className="frame-cetak-biru border-border bg-surface rounded-xl border p-3 sm:p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={app.coverUrl}
                    alt={app.coverAlt || `Tangkapan layar ${app.name}`}
                    fetchPriority="high"
                    className={cn(
                      "border-border w-full rounded-lg border object-cover",
                      retired && "opacity-80 grayscale",
                    )}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Garis bawah dipasang di bingkai seksi, selebar garis seksi lain di halaman ini. */}
      <section aria-label="Ringkasan proyek" className={cn(SHELL, "border-border border-b")}>
        <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-6 py-8", KOLOM_FAKTA[facts.length])}>
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-faint text-xs">{fact.label}</dt>
              <dd className="display-sm mt-1.5 text-[0.9375rem] leading-snug">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {hasDescription || videoId ? (
        <section className={cn(SHELL, "py-16 sm:py-20")}>
          {hasDescription ? (
            <div
              className="prose max-w-3xl [&>*:first-child]:mt-0"
              dangerouslySetInnerHTML={{ __html: app.descriptionHtml ?? "" }}
            />
          ) : null}
          {videoId ? (
            <div
              className={cn(
                "border-border bg-surface overflow-hidden rounded-xl border",
                hasDescription && "mt-12",
              )}
            >
              <YoutubeFacade videoId={videoId} title={`Video ${app.name}`} />
            </div>
          ) : null}
        </section>
      ) : null}

      {app.features.length > 0 ? (
        <SplitSection title="Fitur utama">
          <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {app.features.map((feature, index) => (
              <li key={`${index}-${feature.title}`} className="border-border border-t pt-5">
                {/* Nomor hanya penanda visual; urutan sudah dibacakan sebagai daftar bernomor. */}
                <span aria-hidden className="text-link font-mono text-sm tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="display-sm mt-3 text-lg text-balance">{feature.title}</h3>
                {feature.description ? (
                  <p className="text-muted-foreground mt-2 leading-relaxed">{feature.description}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </SplitSection>
      ) : null}

      {app.gallery.length > 0 ? (
        <section className={cn(SHELL, SECTION, "border-border border-t")}>
          <h2 className="display text-2xl sm:text-[1.75rem]">Galeri</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
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
        </section>
      ) : null}

      {showGuide ? (
        <SplitSection title="Cara pakai">
          <div
            className="prose [&>*:first-child]:mt-0"
            dangerouslySetInnerHTML={{ __html: app.guideHtml ?? "" }}
          />
        </SplitSection>
      ) : null}

      {showFaq ? (
        <SplitSection title="Pertanyaan umum">
          <FaqAccordion items={app.faqs} />
        </SplitSection>
      ) : null}

      {showReleases ? (
        <SplitSection title="Catatan rilis">
          <ol className="space-y-8">
            {app.releases.map((release) => (
              <li key={release.id} className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:gap-8">
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
        </SplitSection>
      ) : null}

      {showTimeline ? (
        <SplitSection title="Catatan pembuatan">
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
        </SplitSection>
      ) : null}

      {others.length > 0 ? (
        <section className={cn(SHELL, SECTION, "border-border border-t")}>
          <SectionHeading title="Proyek lain" href="/apps" linkLabel="Lihat semua proyek" />
          {others.length === 1 && onlyOther ? (
            <div className="mt-10">
              <AppCard app={onlyOther} wide />
            </div>
          ) : (
            <ul
              className={cn("mt-10 grid gap-6 sm:grid-cols-2", others.length === 3 && "lg:grid-cols-3")}
            >
              {others.map((item) => (
                <li key={item.slug}>
                  <AppCard app={item} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <ContactCta title="Punya proyek serupa?" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
