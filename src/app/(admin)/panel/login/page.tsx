import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { SITE } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      {/* Sisi kiri: pernyataan brand, hanya tampil pada layar lebar. */}
      <aside className="bg-noise on-ink relative hidden overflow-hidden bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-signal/25 blur-[120px]"
        />
        <div className="relative flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt=""
            width={211}
            height={96}
            className="h-7 w-auto invert dark:invert-0"
          />
          <span className="display-sm flex items-baseline gap-1 text-[1.0625rem]">
            {SITE.name}
            <span aria-hidden className="h-1.5 w-1.5 bg-signal" />
          </span>
        </div>

        <div className="relative">
          <p className="label-mono inline-flex items-center gap-2 text-background/60">
            <span aria-hidden className="h-2 w-2 bg-signal" />
            Ruang kerja studio
          </p>
          <p className="display mt-8 max-w-md text-balance text-4xl leading-[1.1]">
            Semua isi situs diatur dari satu tempat.
          </p>
          <p className="mt-6 max-w-sm text-pretty leading-relaxed text-background/70">
            Artikel, karya, layanan, media, dan prospek yang masuk. Perubahan langsung tayang tanpa
            menyentuh kode.
          </p>
        </div>

        <p className="relative label-mono text-background/55">
          {SITE.name} · {SITE.tagline}
        </p>
      </aside>

      {/* Sisi kanan: formulir masuk. */}
      <div className="bg-noise relative flex items-center justify-center overflow-hidden px-6 py-16">
        <div aria-hidden className="bg-grid absolute inset-0 lg:hidden" />
        <div className="animate-fade-up relative w-full max-w-sm">
          <div className="lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-mark.png"
              alt=""
              width={211}
              height={96}
              className="mb-8 h-9 w-auto dark:invert"
            />
          </div>

          <p className="label-mono inline-flex items-center gap-2 text-muted-foreground">
            <span aria-hidden className="h-2 w-2 bg-signal" />
            Panel Admin
          </p>
          <h1 className="display mt-6 text-3xl">Selamat datang kembali</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Masuk memakai akun yang terdaftar untuk mengelola isi situs.
          </p>

          <div className="mt-10">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-10 border-t border-border pt-6">
            <Link
              href="/"
              className="link-sweep group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              Kembali ke situs
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
