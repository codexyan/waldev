import { ArrowLink } from "@/components/ui/arrow-link";
import { ServiceIcon } from "@/components/service-icon";

export interface ServiceRow {
  slug: string;
  name: string;
  description: string | null;
  price?: string | null;
}

/**
 * Daftar layanan sebagai kisi tiga kolom.
 *
 * Menggantikan daftar baris besar bergaya indeks editorial. Bentuk kisi
 * memuat enam layanan dalam satu layar tanpa satu pun judul berukuran 30 px,
 * sehingga bagian ini terbaca sebagai keterangan — bukan sebagai enam
 * pengumuman berturut-turut.
 *
 * Deskripsi terbaca di semua ukuran layar, dan harga dari CMS ditampilkan
 * bila kolomnya terisi.
 */
export function ServiceGrid({ services }: { services: ServiceRow[] }) {
  return (
    <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <div key={service.slug}>
          <h3 className="display-sm flex items-center gap-2 text-[0.9375rem]">
            <ServiceIcon slug={service.slug} className="text-link h-4 w-4 shrink-0" />
            {service.name}
          </h3>

          {service.description ? (
            <p className="text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
              {service.description}
            </p>
          ) : null}

          {service.price ? (
            <p className="text-heading mt-2 font-medium tabular-nums">{service.price}</p>
          ) : null}

          <ArrowLink href={`/services/${service.slug}`} className="mt-3">
            Selengkapnya
          </ArrowLink>
        </div>
      ))}
    </div>
  );
}
