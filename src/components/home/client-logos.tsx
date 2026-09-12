export interface ClientLogo {
  name: string;
  websiteUrl: string | null;
  logoUrl: string | null;
}

/**
 * Deretan logo klien tepat di bawah hero (docs/09 §5.1).
 *
 * Logo dibuat pudar supaya tidak bersaing dengan judul, dan warnanya dibalik
 * pada tema gelap. Klien tanpa berkas logo tetap tampil sebagai nama.
 */
export function ClientLogos({ clients }: { clients: ClientLogo[] }) {
  return (
    <div>
      <p className="text-faint text-center text-xs">Pernah bekerja sama dengan</p>
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {clients.map((client, index) => {
          const mark = client.logoUrl ? (
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
          );

          return (
            <li key={`${index}-${client.name}`}>
              {client.websiteUrl ? (
                <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer">
                  {mark}
                </a>
              ) : (
                mark
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
