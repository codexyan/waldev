"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export interface ClientLogo {
  name: string;
  websiteUrl: string | null;
  logoUrl: string | null;
}

/**
 * Deretan logo klien tepat di bawah hero (docs/09 §5.1).
 *
 * Logo muncul satu per satu dari buram ke tajam saat deretannya masuk layar (gaya di
 * globals.css, `.client-logos`). Animasi hanya dipasang bila deretan belum terlihat ketika
 * halaman siap, supaya logo yang sudah tampil tidak berkedip. Tanpa JavaScript atau dengan
 * gerak dikurangi, logo langsung tampil. Klien tanpa berkas logo tampil sebagai nama.
 */
export function ClientLogos({ clients }: { clients: ClientLogo[] }) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (list.getBoundingClientRect().top < window.innerHeight) return;

    // Atribut ditulis langsung ke DOM, bukan lewat state, supaya tidak memicu render ulang.
    list.dataset.reveal = "waiting";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        list.dataset.reveal = "shown";
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <p className="text-faint text-center text-xs">Pernah bekerja sama dengan</p>
      <ul
        ref={listRef}
        className="client-logos mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
      >
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
            <li
              key={`${index}-${client.name}`}
              className="client-logo"
              style={{ "--i": index } as CSSProperties}
            >
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
