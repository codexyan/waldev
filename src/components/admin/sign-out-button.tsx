"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
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
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50",
        className,
      )}
    >
      <LogOut className="h-4 w-4" />
      Keluar
    </button>
  );
}
