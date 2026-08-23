"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  /* Ikon baru dirender setelah hidrasi, karena tema sebenarnya hanya diketahui
     di klien. useSyncExternalStore dipakai alih-alih setState di dalam efek:
     hasilnya sama, tetapi tanpa render berantai. */
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Ganti tema terang atau gelap"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "text-muted-foreground hover:bg-muted hover:text-heading focus-visible:ring-ring relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      {mounted ? (
        <>
          <Sun
            className={cn(
              "absolute h-4 w-4 transition-all duration-300",
              isDark ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0",
            )}
          />
          <Moon
            className={cn(
              "absolute h-4 w-4 transition-all duration-300",
              isDark ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
            )}
          />
        </>
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  );
}
