"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SHELL } from "@/components/ui/shell";
import { StaticLink } from "@/components/ui/static-link";
import { cn } from "@/lib/utils";

export interface HeaderNavItem {
  label: string;
  url: string;
}

/**
 * Kepala situs: merek, navigasi teks, dan pengalih tema. Tidak ada tombol
 * ajakan: situs ini arsip, bukan halaman penjualan.
 *
 * Latarnya tidak berubah mengikuti gulir — header selalu tampil sebagai bidang
 * kertas dengan satu garis tipis di bawahnya.
 */
export function SiteHeader({ brand, nav }: { brand: string; nav: HeaderNavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* Beranda adalah daftar aplikasi, jadi halaman aplikasi ikut menandai tautan beranda. */
  const isActive = (url: string) =>
    url === "/" ? pathname === "/" || pathname.startsWith("/apps/") : pathname.startsWith(url);

  /* Tutup menu setiap kali pindah halaman. Disesuaikan saat render, bukan lewat
     useEffect: memanggil setState di dalam efek memicu render berantai, dan
     menunya sempat terlihat sekejap di halaman baru sebelum tertutup. */
  const [pathSaatIni, setPathSaatIni] = useState(pathname);
  if (pathSaatIni !== pathname) {
    setPathSaatIni(pathname);
    setOpen(false);
  }

  /* Menu ponsel diperlakukan sebagai dialog: scroll halaman dikunci, Escape
     menutup, fokus masuk ke dalam panel lalu dikembalikan ke tombolnya, dan
     Tab tidak bisa keluar ke tautan di belakang overlay. */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Disalin sekarang: saat cleanup berjalan, triggerRef.current bisa sudah
    // menunjuk simpul lain (atau null) sehingga fokus tidak pernah kembali.
    const trigger = triggerRef.current;

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
      );

    focusables()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <header className="border-border bg-background/90 sticky top-0 z-50 border-b backdrop-blur">
      <div className={cn(SHELL, "flex h-14 items-center justify-between gap-6")}>
        <div className="flex items-center gap-8">
          <StaticLink href="/" className="flex shrink-0 items-center gap-2" aria-label={brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-mark.png"
              alt=""
              width={211}
              height={96}
              className="h-6 w-auto dark:invert"
            />
            <span className="display-sm text-[0.9375rem]">{brand}</span>
          </StaticLink>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Navigasi utama">
            {nav.map((item) => (
              <StaticLink
                key={item.url}
                href={item.url}
                aria-current={isActive(item.url) ? "page" : undefined}
                className={cn(
                  "text-sm transition-colors",
                  isActive(item.url)
                    ? "text-heading font-medium"
                    : "text-muted-foreground hover:text-heading",
                )}
              >
                {item.label}
              </StaticLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />

          <button
            ref={triggerRef}
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="menu-ponsel"
            onClick={() => setOpen((value) => !value)}
            className="text-muted-foreground hover:bg-muted hover:text-heading inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Menu layar penuh untuk perangkat kecil. */}
      {open ? (
        <div
          id="menu-ponsel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className="bg-background fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto md:hidden"
        >
          <nav className="flex flex-col px-6 pt-2 pb-10">
            {nav.map((item) => (
              <StaticLink
                key={item.url}
                href={item.url}
                aria-current={isActive(item.url) ? "page" : undefined}
                className={cn(
                  "display-sm border-border border-b py-4 text-xl",
                  isActive(item.url) ? "text-heading" : "text-muted-foreground",
                )}
              >
                {item.label}
              </StaticLink>
            ))}

            {/* Pengalih tema hanya DISALIN ke sini, tidak dipindahkan: panel ini
                `md:hidden`, jadi memindahkannya akan menghapus pengalih tema
                sepenuhnya di layar 768 px ke atas. */}
            <div className="border-border mt-8 flex items-center justify-between border-t pt-6 sm:hidden">
              <span className="text-muted-foreground">Tampilan</span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
