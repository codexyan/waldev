import type { Metadata } from "next";
import { ClientLogos } from "@/components/home/client-logos";
import { Hero, type HeroShowcase } from "@/components/home/hero";
import { ArrowLink } from "@/components/ui/arrow-link";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { SECTION, SHELL } from "@/components/ui/shell";
import { HOME_INTRO, HOME_LEAD } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { listPublishedApps } from "@/modules/apps/app.dal";
import { AppCard } from "@/modules/apps/components/app-card";
import { listPublishedArticles } from "@/modules/articles/article.dal";
import { ArticleCard } from "@/modules/articles/components/article-card";
import { listPublishedClients } from "@/modules/clients/client.dal";
import { getMediaPick } from "@/modules/media/media.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Kartu di beranda: satu kartu unggulan dan paling banyak enam kartu grid (docs/09 §5.1). */
const HOME_APP_LIMIT = 7;

/* Jumlah kolom mengikuti jumlah kartu grid, supaya kartu terakhir jarang berdiri
   sendirian di satu baris. */
function gridCols(count: number): string {
  return count === 2 || count === 4 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
}

/**
 * Beranda (docs/09 §5.1): hero, logo klien, kartu proyek, lalu tulisan terbaru.
 * Logo klien dan tulisan hilang selama isinya kosong, jadi beranda tetap utuh walau
 * baru ada satu aplikasi.
 */
export default async function HomePage() {
  const settings = await getSiteSettings();
  const [apps, clients, { rows: articles }, heroMedia] = await Promise.all([
    listPublishedApps(),
    listPublishedClients(),
    listPublishedArticles({ limit: 3 }),
    getMediaPick(settings.hero_media_id),
  ]);

  // Aplikasi di hero: pilihan di Pengaturan, atau aplikasi teratas yang bergambar dan masih aktif.
  const chosenApp = settings.hero_app_slug
    ? apps.find((app) => app.slug === settings.hero_app_slug)
    : undefined;
  const heroApp = chosenApp ?? apps.find((app) => app.coverUrl && app.status !== "retired");
  const customImage = heroMedia?.kind === "image" ? heroMedia.url : null;
  const heroImage = customImage ?? heroApp?.coverUrl ?? null;
  const showcase: HeroShowcase | null = heroImage
    ? {
        imageUrl: heroImage,
        alt: heroApp
          ? `${customImage ? "Gambar" : "Tangkapan layar"} ${heroApp.name}`
          : "Gambar hero",
        label: heroApp ? (chosenApp ? "Proyek unggulan" : "Proyek terbaru") : null,
        name: heroApp?.name ?? null,
        href: heroApp ? `/apps/${heroApp.slug}` : null,
        building: heroApp?.status === "building",
      }
    : null;

  const [featured, ...others] = apps;
  const gridApps = others.slice(0, HOME_APP_LIMIT - 1);
  const [onlyGridApp] = gridApps;

  return (
    <>
      <Hero
        title={settings.home_intro || HOME_INTRO}
        lead={HOME_LEAD}
        email={settings.contact_email || null}
        showcase={showcase}
      />

      {clients.length > 0 ? (
        <section className={cn(SHELL, "border-border border-t py-10")}>
          <h2 className="sr-only">Klien</h2>
          <ClientLogos clients={clients} />
        </section>
      ) : null}

      <section id="portofolio" className={cn(SHELL, SECTION, "border-border scroll-mt-14 border-t")}>
        <SectionHeading title="Portofolio" />

        {featured ? (
          <>
            <div className="mt-10">
              <AppCard app={featured} wide />
            </div>
            {gridApps.length === 1 && onlyGridApp ? (
              <div className="mt-6">
                <AppCard app={onlyGridApp} wide />
              </div>
            ) : gridApps.length > 1 ? (
              <ul className={cn("mt-6 grid gap-6", gridCols(gridApps.length))}>
                {gridApps.map((app) => (
                  <li key={app.slug}>
                    <AppCard app={app} />
                  </li>
                ))}
              </ul>
            ) : null}
            {apps.length > HOME_APP_LIMIT ? (
              <p className="mt-8">
                <ArrowLink href="/apps">Lihat semua {apps.length} proyek</ArrowLink>
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-muted-foreground mt-10">Proyek pertama masih dalam pengerjaan.</p>
        )}
      </section>

      {articles.length > 0 ? (
        <section className={cn(SHELL, SECTION, "border-border border-t")}>
          <SectionHeading title="Tulisan terbaru" href="/articles" linkLabel="Semua tulisan" />
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} headingLevel="h3" />
            ))}
          </div>
        </section>
      ) : null}

      {/* Penutup seperti situs software house acuan (docs/09 §5.1), tanpa formulir dan WhatsApp.
          Hanya tampil bila email kontak diisi, supaya tombolnya tidak mati. */}
      {settings.contact_email ? (
        <section id="kontak" className={cn(SHELL, SECTION, "border-border scroll-mt-14 border-t")}>
          <SectionHeading
            title="Punya proyek yang ingin dibicarakan?"
            description="Ceritakan kebutuhan aplikasi web atau sistem informasi Anda lewat email ke kami."
          />
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={`mailto:${settings.contact_email}`}
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              Hubungi kami
            </a>
            <span className="text-muted-foreground text-sm break-all">{settings.contact_email}</span>
          </div>
        </section>
      ) : null}
    </>
  );
}
