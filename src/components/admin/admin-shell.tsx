"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, X } from "lucide-react";
import { AdminNav, type NavCounts } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ADMIN_BASE, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface AdminUser {
  name: string;
  email: string;
  role: string | null;
}

/**
 * Kerangka panel admin: sisi kiri menetap di layar lebar, dan berubah menjadi
 * laci yang bisa dibuka pada layar kecil. Sebelumnya menu hilang sama sekali
 * di bawah lebar md, sehingga panel tidak bisa dipakai dari ponsel.
 */
export function AdminShell({
  user,
  counts,
  children,
}: {
  user: AdminUser;
  counts: NavCounts;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /* Tutup laci saat pindah halaman. Disesuaikan ketika render, bukan lewat efek,
     agar tidak memicu render berantai. */
  const [pathSaatIni, setPathSaatIni] = useState(pathname);
  if (pathSaatIni !== pathname) {
    setPathSaatIni(pathname);
    setOpen(false);
  }

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

  const brand = (
    <Link href={ADMIN_BASE} className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt="" width={211} height={96} className="h-6 w-auto dark:invert" />
      <span className="display-sm flex items-baseline gap-1 text-base">
        {SITE.name}
        <span aria-hidden className="bg-primary h-1.5 w-1.5" />
      </span>
      <span className="label text-muted-foreground">Panel</span>
    </Link>
  );

  const sidebarBody = (
    <>
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <AdminNav counts={counts} onNavigate={() => setOpen(false)} />
      </div>
      <div className="border-border border-t px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          Lihat situs
        </a>
      </div>
    </>
  );

  return (
    <div className="admin-scope bg-muted/25 flex min-h-dvh">
      {/* Sisi kiri tetap, layar lebar. */}
      <aside className="border-border bg-background sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r md:flex">
        <div className="border-border flex h-16 shrink-0 items-center border-b px-6">{brand}</div>
        {sidebarBody}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-background/85 sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="border-border text-foreground hover:bg-muted inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <div className="min-w-0 md:hidden">{brand}</div>
            <p className="text-muted-foreground hidden min-w-0 truncate text-sm md:block">
              Halo, <span className="text-foreground font-medium">{user.name}</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <div className="border-border hidden items-center gap-2.5 border-l pl-3 sm:flex">
              <span className="border-border flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="max-w-44 truncate text-xs font-medium">{user.email}</span>
                {user.role ? (
                  <span className="label text-muted-foreground mt-0.5">{user.role}</span>
                ) : null}
              </span>
            </div>
            <SignOutButton />
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Laci menu untuk layar kecil. */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className={cn(
            "bg-foreground/40 absolute inset-0 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "border-border bg-background absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="border-border flex h-16 shrink-0 items-center justify-between border-b px-5">
            {brand}
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setOpen(false)}
              className="border-border text-foreground hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {sidebarBody}
        </div>
      </div>
    </div>
  );
}
