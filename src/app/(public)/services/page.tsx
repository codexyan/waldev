import type { Metadata } from "next";
import Link from "next/link";
import { listActiveServices } from "@/modules/services/service.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description: "Layanan pengembangan produk digital dari WalDev.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const rows = await listActiveServices();

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">Services</h1>
        <p className="mt-3 text-muted-foreground">
          Dari website hingga sistem informasi dan otomasi — dibangun end-to-end.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="mt-16 text-muted-foreground">Belum ada layanan yang ditampilkan.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="card-lift group flex flex-col rounded-xl border border-border bg-card p-6"
            >
              <h2 className="text-lg font-semibold tracking-tight group-hover:text-primary">
                {service.name}
              </h2>
              {service.description ? (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {service.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
