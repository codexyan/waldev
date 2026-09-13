import type { Metadata } from "next";
import { ClientLogos } from "@/components/home/client-logos";
import { Hero } from "@/components/home/hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { SECTION, SHELL } from "@/components/ui/shell";
import { HOME_INTRO, HOME_LEAD } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { listPublishedApps } from "@/modules/apps/app.dal";
import { AppCard } from "@/modules/apps/components/app-card";
import { listPublishedArticles } from "@/modules/articles/article.dal";
import { ArticleCard } from "@/modules/articles/components/article-card";
import { listPublishedClients } from "@/modules/clients/client.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* Jumlah kolom mengikuti jumlah kartu, supaya kartu terakhir jarang berdiri
   sendirian di satu baris. Satu aplikasi memakai kartu lebar (AppCard `wide`). */
function appGridCols(count: number): string {
  if (count <= 1) return "";
  if (count === 2 || count === 4) return "sm:grid-cols-2";
  return "sm:grid-cols-2 lg:grid-cols-3";
}

/**
 * Beranda (docs/09 §5.1): hero, logo klien, kartu aplikasi, lalu tulisan terbaru.
 * Logo klien dan tulisan hilang selama isinya kosong, jadi beranda tetap utuh walau
 * baru ada satu aplikasi.
 */
export default async function HomePage() {
  const [settings, apps, clients, { rows: articles }] = await Promise.all([
    getSiteSettings(),
    listPublishedApps(),
    listPublishedClients(),
    listPublishedArticles({ limit: 3 }),
  ]);

  // Aplikasi yang sudah tidak aktif tidak dipajang di hero.
  const showcase = apps.find((app) => app.coverUrl && app.status !== "retired");

  return (
    <>
      <Hero
        title={settings.home_intro || HOME_INTRO}
        lead={HOME_LEAD}
        email={settings.contact_email || null}
        showcase={
          showcase?.coverUrl
            ? {
                name: showcase.name,
                slug: showcase.slug,
                coverUrl: showcase.coverUrl,
                status: showcase.status,
              }
            : null
        }
      />

      {clients.length > 0 ? (
        <section className={cn(SHELL, "border-border border-t py-10")}>
          <h2 className="sr-only">Klien</h2>
          <ClientLogos clients={clients} />
        </section>
      ) : null}

      <section id="aplikasi" className={cn(SHELL, SECTION, "border-border scroll-mt-14 border-t")}>
        <SectionHeading
          title="Semua aplikasi"
          description="Buka kartu aplikasi untuk melihat penjelasan, fitur, dan catatan pembuatannya."
        />

        {apps.length === 0 ? (
          <p className="text-muted-foreground mt-10">Aplikasi pertama masih dalam pembuatan.</p>
        ) : (
          <ul className={cn("mt-10 grid gap-6", appGridCols(apps.length))}>
            {apps.map((app) => (
              <li key={app.slug}>
                <AppCard app={app} wide={apps.length === 1} />
              </li>
            ))}
          </ul>
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
    </>
  );
}
