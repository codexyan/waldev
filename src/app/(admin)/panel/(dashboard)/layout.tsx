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
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card px-4 py-6 md:block">
        <Link href={ADMIN_BASE} className="px-2 text-lg font-semibold tracking-tight">
          {SITE.name}
          <span className="text-muted-foreground"> Admin</span>
        </Link>
        <AdminNav />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
