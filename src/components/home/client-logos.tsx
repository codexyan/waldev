export interface ClientLogo {
  name: string;
  websiteUrl: string | null;
  logoUrl: string | null;
}

/**
 * Deretan logo klien tepat di bawah hero.
 *
 * Diletakkan sedekat mungkin dengan ajakan pertama karena inilah bukti yang
 * paling cepat dicerna: nama yang dikenali menjawab "ini beneran dipakai
 * orang?" sebelum pengunjung sempat menggulir. Klien tanpa berkas logo tetap
 * tampil sebagai nama, bukan hilang.
 */
export function ClientLogos({ clients }: { clients: ClientLogo[] }) {
  return (
    <div>
      <p className="text-faint text-center text-xs">Dipercaya oleh</p>
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {clients.map((client) => (
          <li key={client.name}>
            {client.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={client.logoUrl}
                alt={client.name}
                loading="lazy"
                decoding="async"
                className="h-7 w-auto max-w-[8rem] object-contain opacity-60 transition-opacity duration-200 hover:opacity-100 dark:invert"
              />
            ) : (
              <span className="display-sm text-faint text-base">{client.name}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
