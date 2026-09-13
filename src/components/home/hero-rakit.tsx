"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { RakitColors, RakitHandle } from "./rakit-scene";

/** three 0.163 ke atas hanya mendukung WebGL 2. */
function supportsWebGL2(): boolean {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

/** Token tema diubah ke warna rgb() lewat elemen bantu, supaya Three.js bisa membacanya. */
function readColors(): RakitColors {
  const probe = document.createElement("span");
  probe.style.display = "none";
  document.body.appendChild(probe);
  const resolve = (token: string) => {
    probe.style.color = `hsl(var(${token}))`;
    return getComputedStyle(probe).color;
  };
  const dark = document.documentElement.classList.contains("dark");
  const colors: RakitColors = {
    surface: resolve("--surface"),
    line: resolve("--border"),
    accent: resolve("--link"),
    shadow: dark ? 0.6 : 0.14,
    dark,
  };
  probe.remove();
  return colors;
}

const waitForPageLoad = () =>
  document.readyState === "complete"
    ? Promise.resolve()
    : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));

/**
 * Gambar hero yang dirakit sebagai kartu 3D di atas lantai cetak biru (docs/09 §16).
 *
 * HTML statis selalu berisi <img> biasa. Gambar itu yang tampil pertama, dan tetap dipakai
 * di layar di bawah 768 px, tanpa JavaScript, atau tanpa WebGL 2. Di layar lebar, Three.js
 * dimuat setelah halaman selesai dimuat. Kartu 3D dimulai datar dengan ukuran dan posisi
 * yang sama persis dengan gambar, kanvas memudar masuk di atasnya, dan gambar baru
 * disembunyikan setelah kanvas menutupinya, sehingga tidak ada kedipan.
 */
export function HeroRakit({ src, alt, building }: { src: string; alt: string; building: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Kanvas mulai memudar masuk. */
  const [ready, setReady] = useState(false);
  /** Kanvas sudah menutup gambar, jadi gambar boleh disembunyikan. */
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !image || !canvas) return;
    if (!window.matchMedia("(min-width: 768px)").matches || !supportsWebGL2()) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let handle: RakitHandle | null = null;
    let cancelled = false;
    let coverTimer = 0;

    // Kartu hanya ikut miring mengikuti mouse; sentuhan dan pena dibiarkan.
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !handle) return;
      const rect = stage.getBoundingClientRect();
      handle.setPointer(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        ((event.clientY - rect.top) / rect.height) * 2 - 1,
      );
    };
    const onLeave = () => handle?.setPointer(0, 0);
    const resizeObserver = new ResizeObserver(() => handle?.resize());
    // next-themes mengganti kelas `dark` di <html>; warna kartu dan lantai mengikuti.
    const themeObserver = new MutationObserver(() => handle?.setColors(readColors()));
    // Lantai berdenyut hanya selama hero terlihat.
    const viewObserver = new IntersectionObserver((entries) =>
      handle?.setVisible(entries.some((entry) => entry.isIntersecting)),
    );

    const boot = async () => {
      await waitForPageLoad();
      await image.decode().catch(() => undefined);
      if (cancelled || !image.naturalWidth) return;
      const { mountRakit } = await import("./rakit-scene");
      if (cancelled) return;
      handle = mountRakit(canvas, image, { building, reducedMotion, colors: readColors() });
      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerleave", onLeave);
      resizeObserver.observe(stage);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      viewObserver.observe(stage);
      setReady(true);
      // Pudar masuk 300 ms. Batas waktu ini berjaga bila transitionend tidak terpicu.
      coverTimer = window.setTimeout(() => setCovered(true), reducedMotion ? 0 : 450);
    };
    // Bila modul atau WebGL gagal, gambar statis tetap tampil.
    boot().catch(() => undefined);

    return () => {
      cancelled = true;
      window.clearTimeout(coverTimer);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      viewObserver.disconnect();
      handle?.dispose();
    };
  }, [building]);

  return (
    <div ref={stageRef} className="relative md:flex md:aspect-[16/10] md:items-center md:justify-center">
      {/* Di layar lebar, ukuran dan posisinya sama dengan kartu 3D saat masih datar (CARD_SHARE). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        /* Gambar paling atas halaman: dimuat lebih awal, bukan malas. */
        fetchPriority="high"
        className={cn(
          "border-border aspect-[16/9] w-full rounded-lg border object-cover object-top md:w-[64%] md:rounded-none",
          covered && "invisible",
        )}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        onTransitionEnd={() => {
          if (ready) setCovered(true);
        }}
        className={cn(
          "rakit-canvas absolute inset-0 hidden h-full w-full transition-opacity duration-300 ease-out motion-reduce:transition-none md:block",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
