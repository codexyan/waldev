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
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
      {/* Latar senada dengan hero situs publik */}
      <div aria-hidden className="bg-grid absolute inset-0" />
      <div
        aria-hidden
        className="absolute left-1/2 top-[-16rem] h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />

      <div className="animate-fade-up relative w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
          <div className="mb-8 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-mark.png"
              alt=""
              width={211}
              height={96}
              className="mx-auto mb-5 h-10 w-auto dark:invert"
            />
            <h1 className="text-xl font-semibold tracking-tight">
              {SITE.name}
              <span className="text-primary">.</span> Admin
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Masuk untuk mengelola konten studio
            </p>
          </div>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke situs
          </Link>
        </p>
      </div>
    </main>
  );
}
