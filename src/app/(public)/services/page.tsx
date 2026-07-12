import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceIcon } from "@/components/service-icon";
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
      <header className="max-w-2xl" data-reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Layanan</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Services</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Dari website hingga sistem informasi dan otomasi, semuanya dibangun end-to-end.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="mt-16 text-muted-foreground">Belum ada layanan yang ditampilkan.</p>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((service, i) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="card-lift group flex flex-col rounded-xl border border-border bg-card p-6"
              data-reveal
              style={{ transitionDelay: `${(i % 3) * 80}ms` }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                <ServiceIcon slug={service.slug} className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-tight group-hover:text-primary">
                {service.name}
              </h2>
              {service.description ? (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              ) : null}
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Selengkapnya <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
