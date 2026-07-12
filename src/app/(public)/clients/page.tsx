import type { Metadata } from "next";
import { listPublishedClients } from "@/modules/clients/client.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clients",
  description: "Klien dan mitra yang telah bekerja sama dengan WalDev.",
  alternates: { canonical: "/clients" },
};

export default async function ClientsPublicPage() {
  const rows = await listPublishedClients();

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <header className="max-w-2xl" data-reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Klien &amp; Mitra
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Clients</h1>
        <p className="mt-3 text-muted-foreground">Dipercaya oleh berbagai klien dan mitra.</p>
      </header>

      {rows.length === 0 ? (
        <p className="mt-16 text-muted-foreground">Belum ada klien yang ditampilkan.</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {rows.map((client, i) => (
            <div
              key={`${client.name}-${i}`}
              className="card-lift flex h-24 items-center justify-center rounded-xl border border-border bg-card p-6"
              title={client.name}
              data-reveal
              style={{ transitionDelay: `${(i % 5) * 60}ms` }}
            >
              {client.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={client.logoUrl} alt={client.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-sm font-medium text-muted-foreground">{client.name}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
