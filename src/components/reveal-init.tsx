"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Mengaktifkan animasi reveal-on-scroll untuk semua elemen [data-reveal]
 * di halaman publik. Satu IntersectionObserver global; elemen server
 * component cukup diberi atribut data-reveal (tanpa wrapper client).
 */
export function RevealInit() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"),
    );
    if (els.length === 0) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      for (const el of els) el.classList.add("is-visible");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
