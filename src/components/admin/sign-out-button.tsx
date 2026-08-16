"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { authClient } from "@/server/auth/client";
import { ADMIN_BASE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await authClient.signOut();
    router.replace(`${ADMIN_BASE}/login`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      aria-label="Keluar dari panel"
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-muted hover:text-foreground disabled:opacity-50 sm:px-4",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <LogOut className="h-4 w-4" aria-hidden />
      )}
      <span className="hidden sm:inline">Keluar</span>
    </button>
  );
}
