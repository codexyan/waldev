import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "border-input bg-background placeholder:text-muted-foreground hover:border-foreground/30 focus-visible:border-foreground focus-visible:ring-ring/25 h-10 w-full rounded-md border px-3 text-sm transition-colors duration-200 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
