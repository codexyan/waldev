import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "border-input bg-background placeholder:text-muted-foreground hover:border-foreground/30 focus-visible:border-foreground focus-visible:ring-ring/25 min-h-24 w-full rounded-md border px-3 py-2.5 text-sm leading-relaxed transition-colors duration-200 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
