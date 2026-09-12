import type { Metadata } from "next";
import Link from "next/link";
import { SHELL } from "@/components/ui/shell";
import { HOME_INTRO } from "@/lib/constants";
import { formatMonthYear } from "@/lib/date";
import { cn } from "@/lib/utils";
import { listPublishedApps } from "@/modules/apps/app.dal";
import { AppStatusText } from "@/modules/apps/components/app-status";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Beranda = daftar arsip (docs/09 §5.1): satu kalimat pengantar, lalu satu baris
 * per aplikasi. Tanpa gambar dan tanpa tombol ajakan, supaya tetap terlihat utuh
 * walau baru ada satu aplikasi.
 */
export default async function HomePage() {
  const [settings, apps] = await Promise.all([getSiteSettings(), listPublishedApps()]);
  const intro = settings.home_intro || HOME_INTRO;

  return (
    <>
      <header className="border-border border-b">
        <div className={cn(SHELL, "py-14 sm:py-20")}>
          <h1 className="display max-w-3xl text-[2rem] text-balance sm:text-4xl lg:text-5xl">
            {intro}
          </h1>
        </div>
      </header>

      <section className={cn(SHELL, "py-10 sm:py-14")} aria-label="Daftar aplikasi">
        {apps.length === 0 ? (
          <p className="text-muted-foreground">Aplikasi pertama sedang disiapkan.</p>
        ) : (
          <ul className="border-border border-t">
            {apps.map((app) => (
              <li key={app.slug} className="border-border border-b">
                <Link
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
                    <span className="text-faint" title="Catatan terakhir">
                      {app.lastActivityAt
                        ? formatMonthYear(app.lastActivityAt)
                        : "Belum ada catatan"}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
