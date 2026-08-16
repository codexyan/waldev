"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ServiceIcon } from "@/components/service-icon";

export interface ServiceRow {
  slug: string;
  name: string;
  description: string | null;
}

/**
 * Daftar layanan bergaya indeks editorial. Baris menyapu saat disentuh kursor,
 * dan sebuah kartu pratinjau kecil mengikuti kursor pada perangkat desktop.
 */
export function ServiceRows({ services }: { services: ServiceRow[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const x = event.clientX;
    const y = event.clientY;
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const node = previewRef.current;
      if (node) node.style.transform = `translate3d(${x + 28}px, ${y - 90}px, 0)`;
    });
  };

  const activeService = active === null ? null : services[active];

  return (
    <div
      className="relative"
      onPointerMove={handleMove}
      onPointerLeave={() => setActive(null)}
    >
      {services.map((service, index) => (
        <Link
          key={service.slug}
          href={`/services/${service.slug}`}
          className="row-sweep group flex items-center gap-6 border-t border-border px-2 py-7 sm:gap-10 sm:px-4 sm:py-9"
          onPointerEnter={() => setActive(index)}
          onFocus={() => setActive(index)}
          data-reveal
        >
          <span className="label-mono w-7 shrink-0 text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="display-sm flex-1 text-2xl transition-transform duration-500 group-hover:translate-x-2 sm:text-3xl lg:text-4xl">
            {service.name}
          </h3>
          {service.description ? (
            <p className="hidden w-64 shrink-0 text-sm leading-relaxed text-muted-foreground lg:line-clamp-2">
              {service.description}
            </p>
          ) : null}
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-500 group-hover:border-transparent group-hover:bg-signal group-hover:text-signal-foreground">
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      ))}
      <div className="border-t border-border" />

      {enabled ? (
        <div
          aria-hidden
          ref={previewRef}
          className="pointer-events-none fixed left-0 top-0 z-30 hidden lg:block"
        >
          <div
            className={`flex h-44 w-64 flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-2xl shadow-foreground/10 transition-all duration-300 ${
              activeService ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-signal text-signal-foreground">
              {activeService ? (
                <ServiceIcon slug={activeService.slug} className="h-5 w-5" />
              ) : null}
            </span>
            <div>
              <p className="label-mono text-muted-foreground">Layanan</p>
              <p className="display-sm mt-2 text-lg">{activeService?.name}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
