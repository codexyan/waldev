import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Label mikro monospace dengan penanda kotak sinyal. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("label-mono inline-flex items-center gap-2 text-muted-foreground", className)}>
      <span aria-hidden className="h-2 w-2 shrink-0 bg-signal" />
      {children}
    </span>
  );
}

/**
 * Kepala seksi bergaya editorial: nomor urut, eyebrow, judul display,
 * deskripsi opsional, dan tautan "lihat semua" di sisi kanan.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Lihat semua",
  className,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-border pt-6", className)} data-reveal>
      <div className="flex items-start justify-between gap-6">
        <Eyebrow>{eyebrow}</Eyebrow>
        {index ? (
          <span className="label-mono text-muted-foreground">{index}</span>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 className="display max-w-2xl text-balance text-3xl sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
        {href ? (
          <Link
            href={href}
            className="link-sweep group inline-flex shrink-0 items-center gap-2 text-sm font-medium"
          >
            {linkLabel}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        ) : null}
      </div>

      {description ? (
        <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
