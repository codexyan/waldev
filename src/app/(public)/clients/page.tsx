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
        description="Dari usaha kecil sampai instansi. Sebagian proyek tidak dapat kami tampilkan karena terikat perjanjian kerahasiaan."
      />

      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        {rows.length === 0 ? (
          <p className="text-muted-foreground">Belum ada klien yang ditampilkan.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {rows.map((client, index) => (
              <li
                key={`${client.name}-${index}`}
                className="border-border bg-card flex h-24 items-center justify-center rounded-xl border p-6"
                title={client.name}
              >
                {client.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={client.logoUrl}
                    alt={client.name}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain opacity-70 dark:invert"
                  />
                ) : (
                  <span className="display-sm text-muted-foreground text-center">
                    {client.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-4 sm:pt-24">
        <CtaPanel
          title="Ingin bergabung di daftar ini?"
          body="Kami menerima proyek baru setiap bulan, dengan jumlah terbatas supaya setiap klien mendapat perhatian penuh."
        />
      </section>
    </>
  );
}
