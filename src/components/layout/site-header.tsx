"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HeaderNavItem {
  label: string;
  url: string;
}

export function SiteHeader({ brand, nav }: { brand: string; nav: HeaderNavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  // Tutup menu setiap kali pindah halaman.
  useEffect(() => setOpen(false), [pathname]);

  // Status scroll untuk latar header + bilah progres baca.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      setScrolled(window.scrollY > 8);
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 8 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Kunci scroll halaman & tutup dengan Escape saat menu terbuka.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled || open
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 transition-[height] duration-500 lg:px-10",
          scrolled || open ? "h-16" : "h-20",
        )}
      >
        <Link href="/" className="group flex items-center gap-2.5" aria-label={brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt=""
            width={211}
            height={96}
            className="h-7 w-auto transition-transform duration-500 group-hover:-rotate-3 dark:invert"
          />
          <span className="display-sm flex items-baseline gap-1 text-[1.0625rem]">
            {brand}
            <span aria-hidden className="h-1.5 w-1.5 bg-signal" />
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "link-sweep py-1 text-sm transition-colors",
                isActive(item.url)
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/collaboration" className="hidden sm:block">
            <Button size="sm" className="group">
              Mulai proyek
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
          <button
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Bilah progres baca setipis rambut. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
        <div
          ref={progressRef}
          className="h-full origin-left bg-signal"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      {/* Menu layar penuh untuk perangkat kecil. */}
      {open ? (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-background md:hidden">
          <nav className="flex flex-col px-6 pb-10 pt-4">
            {nav.map((item, index) => (
              <Link
                key={item.url}
                href={item.url}
                className="animate-fade-up group flex items-center justify-between border-b border-border py-5"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <span
                  className={cn(
                    "display-sm text-3xl",
                    isActive(item.url) ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ))}
            <Link
              href="/collaboration"
              className="animate-fade-up mt-8"
              style={{ animationDelay: `${nav.length * 60}ms` }}
            >
              <Button size="lg" className="w-full">
                Mulai proyek
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
