import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium leading-5",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-foreground",
        secondary: "border-transparent bg-muted text-muted-foreground",
        outline: "border-border text-muted-foreground",
        signal: "border-transparent bg-primary text-primary-foreground",
        success: "border-emerald-600/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        warning: "border-amber-600/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        destructive: "border-destructive/25 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
