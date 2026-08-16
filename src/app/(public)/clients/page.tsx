import type { Metadata } from "next";
import { CtaPanel } from "@/components/cta-panel";
import { PageHeader } from "@/components/page-header";
import { listPublishedClients } from "@/modules/clients/client.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Klien",
  description: "Klien dan mitra yang telah bekerja sama dengan WalDev.",
  alternates: { canonical: "/clients" },
};

export default async function ClientsPublicPage() {
  const rows = await listPublishedClients();

  return (
    <>
      <PageHeader
        eyebrow="Klien dan Mitra"
        title={["Dipercaya lintas", "bidang usaha."]}
        marked="bidang usaha."
        description="Dari usaha kecil sampai instansi. Sebagian proyek tidak dapat kami tampilkan karena terikat perjanjian kerahasiaan."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-10">
        {rows.length === 0 ? (
          <p className="text-muted-foreground">Belum ada klien yang ditampilkan.</p>
        ) : (
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
            {rows.map((client, index) => (
              <div
                key={`${client.name}-${index}`}
                className="flex h-32 items-center justify-center bg-background p-8 transition-colors duration-500 hover:bg-muted"
                title={client.name}
                data-reveal
                style={{ transitionDelay: `${(index % 4) * 60}ms` }}
              >
                {client.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={client.logoUrl}
                    alt={client.name}
                    className="max-h-full max-w-full object-contain opacity-60 transition-opacity duration-500 hover:opacity-100"
                  />
                ) : (
                  <span className="display-sm text-center text-base text-muted-foreground">
                    {client.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 lg:px-10">
        <CtaPanel
          title="Ingin bergabung di daftar ini?"
          body="Kami menerima proyek baru setiap bulan, dengan jumlah terbatas supaya setiap klien mendapat perhatian penuh."
        />
      </section>
    </>
  );
}
