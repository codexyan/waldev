import type { Metadata } from "next";
import { ClientLogos } from "@/components/home/client-logos";
import { Hero } from "@/components/home/hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { SECTION, SHELL } from "@/components/ui/shell";
import { StaticLink } from "@/components/ui/static-link";
import { HOME_INTRO, HOME_LEAD } from "@/lib/constants";
import { formatMonthYear } from "@/lib/date";
import { cn } from "@/lib/utils";
import { listPublishedApps } from "@/modules/apps/app.dal";
import { AppStatusText } from "@/modules/apps/components/app-status";
import { listPublishedArticles } from "@/modules/articles/article.dal";
import { ArticleCard } from "@/modules/articles/components/article-card";
import { listPublishedClients } from "@/modules/clients/client.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Beranda (docs/09 §5.1): hero, logo klien, daftar aplikasi, lalu tulisan terbaru.
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
            ? { name: showcase.name, slug: showcase.slug, coverUrl: showcase.coverUrl }
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
          description="Klik nama aplikasi untuk melihat fitur dan catatan pembuatannya."
        />

        {apps.length === 0 ? (
          <p className="text-muted-foreground mt-10">Aplikasi pertama masih dalam pembuatan.</p>
        ) : (
          <ul className="border-border mt-10 border-t">
            {apps.map((app) => (
              <li key={app.slug} className="border-border border-b">
                <StaticLink
                  href={`/apps/${app.slug}`}
                  className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
                >
                  <span className="min-w-0">
                    <span className="display-sm group-hover:text-link block text-base transition-colors">
                      {app.name}
                    </span>
                    {app.tagline ? (
                      <span className="text-muted-foreground mt-1 block leading-relaxed text-pretty">
                        {app.tagline}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs sm:flex-col sm:items-end sm:gap-1">
                    <AppStatusText status={app.status} className="font-medium" />
                    <span aria-hidden className="text-faint sm:hidden">
                      ·
                    </span>
                    <span className="text-faint">
                      {app.lastActivityAt
                        ? `Diperbarui ${formatMonthYear(app.lastActivityAt)}`
                        : "Belum ada catatan"}
                    </span>
                  </span>
                </StaticLink>
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
