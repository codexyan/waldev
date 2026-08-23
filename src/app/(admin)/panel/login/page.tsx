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
      <aside className="on-ink bg-foreground text-background relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="bg-primary/25 pointer-events-none absolute top-1/3 -left-24 h-96 w-96 rounded-full blur-[120px]"
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
            <span aria-hidden className="bg-primary h-1.5 w-1.5" />
          </span>
        </div>

        <div className="relative">
          <p className="label text-background/60 inline-flex items-center gap-2">
            <span aria-hidden className="bg-primary h-2 w-2" />
            Ruang kerja studio
          </p>
          <p className="display mt-8 max-w-md text-4xl leading-[1.1] text-balance">
            Semua isi situs diatur dari satu tempat.
          </p>
          <p className="text-background/70 mt-6 max-w-sm leading-relaxed text-pretty">
            Artikel, karya, layanan, media, dan prospek yang masuk. Perubahan langsung tayang tanpa
            menyentuh kode.
          </p>
        </div>

        <p className="label text-background/60 relative">
          {SITE.name} · {SITE.tagline}
        </p>
      </aside>

      {/* Sisi kanan: formulir masuk. */}
      <div className="relative flex items-center justify-center overflow-hidden px-6 py-16">
        <div aria-hidden className="absolute inset-0 lg:hidden" />
        <div className="relative w-full max-w-sm">
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

          <p className="label text-muted-foreground inline-flex items-center gap-2">
            <span aria-hidden className="bg-primary h-2 w-2" />
            Panel Admin
          </p>
          <h1 className="display mt-6 text-3xl">Selamat datang kembali</h1>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Masuk memakai akun yang terdaftar untuk mengelola isi situs.
          </p>

          <div className="mt-10">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="border-border mt-10 border-t pt-6">
            <Link
              href="/"
              className="link group text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
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
