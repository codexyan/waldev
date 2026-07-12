import Link from "next/link";
import { requireSession } from "@/server/auth/session";
import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ADMIN_BASE, SITE } from "@/lib/constants";

// Area terautentikasi → selalu dinamis (per-user, tanpa cache).
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession();

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border/60 bg-card px-4 py-6 md:flex">
        <Link href={ADMIN_BASE} className="flex items-center gap-2.5 px-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt=""
            width={211}
            height={96}
            className="h-6 w-auto dark:invert"
          />
          <span className="text-base font-semibold tracking-tight">
            {SITE.name}
            <span className="text-primary">.</span>
            <span className="font-normal text-muted-foreground"> Admin</span>
          </span>
        </Link>
        <div className="mt-2 flex-1 overflow-y-auto pb-4">
          <AdminNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-6 backdrop-blur-md lg:px-10">
          <p className="truncate text-sm text-muted-foreground">
            Selamat datang, <span className="font-medium text-foreground">{user.name}</span>
          </p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="max-w-44 truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
