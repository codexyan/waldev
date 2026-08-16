import type { Metadata } from "next";
import { CtaPanel } from "@/components/cta-panel";
import { ServiceRows } from "@/components/home/service-rows";
import { PageHeader } from "@/components/page-header";
import { ProcessTimeline } from "@/components/process-timeline";
import { Eyebrow } from "@/components/ui/section-heading";
import { listActiveServices } from "@/modules/services/service.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Layanan",
  description:
    "Layanan pengembangan produk digital WalDev: website, sistem informasi, dashboard internal, integrasi AI, dan otomasi proses.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const rows = await listActiveServices();

  return (
    <>
      <PageHeader
        eyebrow="Layanan"
        title={["Dibangun sesuai", "kebutuhan nyata."]}
        marked="nyata."
        description="Kami tidak menjual paket seragam. Cakupan disusun dari masalah yang ingin Anda selesaikan, lalu dikerjakan bertahap sampai benar benar dipakai."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-10">
        {rows.length === 0 ? (
          <p className="text-muted-foreground">Belum ada layanan yang ditampilkan.</p>
        ) : (
          <ServiceRows services={rows} />
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="border-t border-border pt-6" data-reveal>
              <Eyebrow>Proses</Eyebrow>
              <h2 className="display mt-8 text-balance text-3xl sm:text-4xl">
                Sama untuk setiap layanan
              </h2>
              <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
                Apa pun jenis pekerjaannya, urutan kerjanya sama dan transparan. Anda tahu persis
                sedang berada di tahap mana dan apa yang akan diterima berikutnya.
              </p>
            </div>
          </div>
          <ProcessTimeline />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-10">
        <CtaPanel
          title="Belum yakin butuh layanan yang mana?"
          body="Ceritakan kondisi bisnis Anda. Kami bantu pilihkan cakupan yang paling masuk akal, termasuk bila jawabannya adalah mulai dari yang paling kecil."
          ctaLabel="Konsultasi gratis"
        />
      </section>
    </>
  );
}
