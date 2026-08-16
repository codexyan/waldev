"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Satu runtime kecil untuk seluruh gerak di situs publik.
 *
 * Markup tetap dirender di server; komponen ini hanya membaca atribut data
 * lalu memasang observer/listener yang diperlukan:
 *
 *   [data-reveal]          muncul saat masuk viewport (varian: wipe, scale, left)
 *   [data-count]           angka menghitung naik saat terlihat
 *   [data-spotlight]       mengisi --mx/--my untuk sorotan mengikuti kursor
 *   [data-magnetic]        elemen tertarik pelan ke arah kursor
 *   [data-tilt]            kemiringan 3D halus mengikuti kursor
 *
 * Semua efek dimatikan saat pengguna memilih "kurangi gerak", dan efek
 * berbasis kursor hanya aktif pada perangkat dengan penunjuk presisi.
 */
export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    /* ------------------------- Reveal saat scroll ------------------------- */
    const revealEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"),
    );

    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      for (const el of revealEls) el.classList.add("is-visible");
    } else if (revealEls.length > 0) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      );
      for (const el of revealEls) io.observe(el);
      cleanups.push(() => io.disconnect());
    }

    /* --------------------------- Angka menghitung ------------------------- */
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    if (!reducedMotion && counters.length > 0 && typeof IntersectionObserver !== "undefined") {
      const frames = new Set<number>();
      const run = (el: HTMLElement) => {
        const target = Number(el.dataset.count);
        if (!Number.isFinite(target)) return;
        const suffix = el.dataset.countSuffix ?? "";
        const duration = 1400;
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // easeOutExpo: cepat di awal, mendarat halus.
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (t < 1) frames.add(requestAnimationFrame(step));
        };
        el.textContent = `0${suffix}`;
        frames.add(requestAnimationFrame(step));
      };

      const countIo = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            run(entry.target as HTMLElement);
            countIo.unobserve(entry.target);
          }
        },
        { threshold: 0.6 },
      );
      for (const el of counters) countIo.observe(el);
      cleanups.push(() => {
        countIo.disconnect();
        for (const id of frames) cancelAnimationFrame(id);
      });
    }

    /* -------------------------- Efek berbasis kursor ---------------------- */
    if (finePointer && !reducedMotion) {
      // Sorotan: simpan posisi kursor relatif terhadap elemen.
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-spotlight]"))) {
        const onMove = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
          el.style.setProperty("--my", `${event.clientY - rect.top}px`);
        };
        el.addEventListener("pointermove", onMove);
        cleanups.push(() => el.removeEventListener("pointermove", onMove));
      }

      // Magnetik: elemen bergeser sedikit ke arah kursor lalu kembali.
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"))) {
        const strength = Number(el.dataset.magnetic) || 0.25;
        const onMove = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
        };
        const onLeave = () => {
          el.style.transform = "";
        };
        el.style.transition = "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)";
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          el.style.transform = "";
        });
      }

      // Kemiringan 3D halus untuk kartu karya.
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"))) {
        const max = Number(el.dataset.tilt) || 5;
        const onMove = (event: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg)`;
        };
        const onLeave = () => {
          el.style.transform = "";
        };
        el.style.transition = "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)";
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          el.style.transform = "";
        });
      }
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [pathname]);

  return null;
}
