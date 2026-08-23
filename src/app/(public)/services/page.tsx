import type { Metadata } from "next";
import { CtaPanel } from "@/components/cta-panel";
import { ServiceGrid } from "@/components/home/service-grid";
import { PageHeader } from "@/components/page-header";
import { ArrowLink } from "@/components/ui/arrow-link";
import { SectionHeading } from "@/components/ui/section-heading";
import { SECTION, SHELL } from "@/components/ui/shell";
import { cn } from "@/lib/utils";
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
  const adaHarga = rows.some((row) => row.price && /rp/i.test(row.price));

  return (
    <>
      <PageHeader
        eyebrow="Layanan"
        title="Dibangun sesuai kebutuhan nyata."
        description="Cakupan disusun dari masalah yang ingin Anda selesaikan, lalu dikerjakan bertahap sampai benar-benar dipakai. Angka di bawah adalah titik awalnya."
      />

      <section className={cn(SHELL, SECTION)}>
        {rows.length === 0 ? (
          <p className="text-muted-foreground">Belum ada layanan yang ditampilkan.</p>
        ) : (
          <>
            <h2 className="sr-only">Daftar layanan</h2>
            <ServiceGrid services={rows} />
            {adaHarga ? (
              <p className="text-faint mt-10 max-w-2xl leading-relaxed">
                Angka di atas adalah titik awal, bukan harga mati. Biaya akhir mengikuti jumlah
                halaman dan fitur yang benar-benar Anda butuhkan, dan selalu kami kirim tertulis
                sebelum apa pun dimulai.
              </p>
            ) : null}
          </>
        )}
      </section>

      {/* Timeline lima tahap yang identik sebelumnya tampil di tiga halaman
          sekaligus. Kini ia hidup di satu tempat saja — /about — dan halaman
          ini cukup menunjuk ke sana supaya daftar layanan tetap fokus. */}
      <section className={cn(SHELL, SECTION, "border-border border-t")}>
        <SectionHeading
          title="Urutan kerjanya selalu sama"
          description="Apa pun jenis pekerjaannya, Anda selalu tahu sedang berada di tahap mana dan apa yang akan diterima berikutnya."
        />
        <p className="mt-5">
          <ArrowLink href="/about">Lihat tahapan kerjanya</ArrowLink>
        </p>
      </section>

      <section className={cn(SHELL, "pt-16 pb-4 sm:pt-24")}>
        <CtaPanel
          title="Belum yakin butuh layanan yang mana?"
          body="Ceritakan kondisi bisnis Anda. Kami bantu pilihkan cakupan yang paling masuk akal, termasuk bila jawabannya adalah mulai dari yang paling kecil."
        />
      </section>
    </>
  );
}
