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
  const colors: RakitColors = {
    surface: resolve("--surface"),
    line: resolve("--border"),
    accent: resolve("--primary"),
    shadow: document.documentElement.classList.contains("dark") ? 0.7 : 0.26,
  };
  probe.remove();
  return colors;
}

const waitForPageLoad = () =>
  document.readyState === "complete"
    ? Promise.resolve()
    : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));

/**
 * Tangkapan layar hero yang dirakit sebagai kartu 3D (docs/09 §16).
 *
 * HTML statis selalu berisi <img> biasa. Gambar itu yang tampil pertama, dan tetap
 * dipakai di layar di bawah 768 px, tanpa JavaScript, atau tanpa WebGL 2. Di layar
 * lebar, Three.js dimuat setelah halaman selesai dimuat, lalu kanvas menggantikan
 * gambar di wadah yang sama sehingga tata letak diam. Pengunjung yang meminta gerak
 * dikurangi tetap melihat kartu 3D, langsung di posisi akhir tanpa urutan perakitan.
 */
export function HeroRakit({ src, alt, building }: { src: string; alt: string; building: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !image || !canvas) return;
    if (!window.matchMedia("(min-width: 768px)").matches || !supportsWebGL2()) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let handle: RakitHandle | null = null;
    let cancelled = false;

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
    // next-themes mengganti kelas `dark` di <html>; warna kartu mengikuti.
    const themeObserver = new MutationObserver(() => handle?.setColors(readColors()));

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
      setReady(true);
    };
    // Bila modul atau WebGL gagal, gambar statis tetap tampil.
    boot().catch(() => undefined);

    return () => {
      cancelled = true;
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      handle?.dispose();
    };
  }, [building]);

  return (
    <div ref={stageRef} className="relative md:flex md:aspect-[16/10] md:items-center md:justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        /* Gambar paling atas halaman: dimuat lebih awal, bukan malas. */
        fetchPriority="high"
        className={cn(
          "border-border aspect-[16/9] w-full rounded-lg border object-cover object-top md:w-[64%]",
          ready && "invisible",
        )}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn(
          "absolute inset-0 hidden h-full w-full transition-opacity duration-300 motion-reduce:transition-none md:block",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
