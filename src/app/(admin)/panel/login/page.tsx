import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt=""
            width={211}
            height={96}
            className="mx-auto mb-4 h-10 w-auto dark:invert"
          />
          <p className="text-lg font-semibold tracking-tight">{SITE.name} Admin</p>
          <p className="mt-1 text-sm text-muted-foreground">Masuk untuk mengelola konten</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
