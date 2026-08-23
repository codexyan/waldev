import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Tombol. Persegi bersudut lembut, tanpa bayangan dan tanpa terangkat saat
 * disentuh kursor — satu-satunya perubahan adalah warna bidangnya.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /** Aksi utama: bidang biru, satu-satunya warna di halaman. */
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        /** Bidang tinta pekat, dipakai untuk aksi sekunder yang tetap tegas. */
        ink: "bg-ink text-ink-foreground hover:opacity-90",
        outline: "border border-border bg-card text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        /* Alias lama. Dipertahankan agar pemakaian yang belum tersapu tidak
           berubah bentuk; warnanya kini sama dengan aksi utama. */
        signal: "bg-primary text-primary-foreground hover:bg-primary-hover",
      },
      size: {
        default: "h-9 px-4 text-sm",
        sm: "h-8 px-3 text-[0.8125rem]",
        lg: "h-10 px-5 text-sm",
        xl: "h-11 px-6 text-[0.9375rem]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
