import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SECTION, SHELL } from "@/components/ui/shell";
import { cn } from "@/lib/utils";
import { listPublishedApps } from "@/modules/apps/app.dal";
import type { AppStatus } from "@/modules/apps/app.schema";
import { AppCard } from "@/modules/apps/components/app-card";
import { AppStatusFilter } from "@/modules/apps/components/app-status-filter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portofolio",
  description: "Semua proyek yang kami kerjakan, termasuk yang masih dibangun dan yang sudah tidak aktif.",
  alternates: { canonical: "/apps" },
};

/**
 * Halaman Semua proyek (docs/09 §5.1). Beranda memuat paling banyak tujuh kartu dan
 * menautkan ke sini saat proyeknya lebih banyak.
 */
export default async function AppsPage() {
  const apps = await listPublishedApps();
  const counts: Record<AppStatus, number> = { building: 0, released: 0, retired: 0 };
  apps.forEach((app) => {
    counts[app.status] += 1;
  });
  const [onlyApp] = apps;

  return (
    <>
      <PageHeader
        eyebrow="Portofolio"
        title="Semua proyek"
        description="Proyek yang sedang dan pernah kami kerjakan. Buka kartu untuk melihat penjelasan, fitur, dan tangkapan layar setiap proyek."
      />

      <section className={cn(SHELL, SECTION)}>
        {apps.length === 0 ? (
          <p className="text-muted-foreground">Proyek pertama masih dalam pengerjaan.</p>
        ) : apps.length === 1 && onlyApp ? (
          <AppCard app={onlyApp} wide />
        ) : (
          <AppStatusFilter total={apps.length} counts={counts}>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {apps.map((app) => (
                <li key={app.slug} data-status={app.status}>
                  <AppCard app={app} />
                </li>
              ))}
            </ul>
          </AppStatusFilter>
        )}
      </section>
    </>
  );
}
