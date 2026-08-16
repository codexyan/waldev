import type { Metadata } from "next";
import { CtaPanel } from "@/components/cta-panel";
import { PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { listPublishedPortfolios } from "@/modules/portfolio/portfolio.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Karya",
  description:
    "Studi kasus proyek digital yang dikerjakan WalDev, lengkap dengan tantangan, pendekatan, dan hasilnya.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const rows = await listPublishedPortfolios();

  return (
    <>
      <PageHeader
        eyebrow="Karya"
        title={["Bukti lebih baik", "daripada janji."]}
        marked="janji."
        description="Setiap karya di bawah ini kami tulis sebagai studi kasus: apa masalahnya, keputusan apa yang diambil, dan bagaimana hasilnya dipakai sehari hari."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-10">
        {rows.length === 0 ? (
          <p className="text-muted-foreground">Belum ada proyek yang ditampilkan.</p>
        ) : (
          <div className="grid gap-14 sm:grid-cols-2 sm:gap-x-10 lg:gap-x-14">
            <h2 className="sr-only sm:col-span-2">Daftar karya</h2>
            {rows.map((item, index) => {
              const wide = index % 3 === 0;
              return (
                <div key={item.slug} className={wide ? "sm:col-span-2" : undefined}>
                  <ProjectCard
                    item={item}
                    index={index}
                    wide={wide}
                    delay={wide ? 0 : (index % 2) * 90}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-10">
        <CtaPanel
          title="Proyek Anda bisa jadi cerita berikutnya."
          body="Ceritakan apa yang sedang Anda bangun. Kami bantu rumuskan cakupannya, lalu kerjakan dengan proses yang sama seperti karya di atas."
        />
      </section>
    </>
  );
}
