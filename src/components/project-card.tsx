import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProjectCardItem {
  slug: string;
  title: string;
  summary: string | null;
  clientName: string | null;
  isConfidential: boolean;
  thumbnailUrl: string | null;
}

/**
 * Kartu proyek: gambar melebar halus saat disentuh kursor, sorotan sinyal
 * mengikuti kursor, dan tanda panah muncul dari bawah.
 */
export function ProjectCard({
  item,
  index,
  wide = false,
  delay = 0,
}: {
  item: ProjectCardItem;
  index: number;
  wide?: boolean;
  delay?: number;
}) {
  const clientLabel = item.isConfidential ? "Proyek rahasia" : (item.clientName ?? "Proyek");

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="group block"
      data-reveal
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className="spotlight relative overflow-hidden rounded-lg border border-border bg-muted"
        data-spotlight
        data-tilt="3.5"
      >
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt=""
            className={cn(
              "w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]",
              wide ? "aspect-[16/8]" : "aspect-[4/3]",
            )}
          />
        ) : (
          <div
            className={cn(
              "bg-grid flex w-full items-center justify-center",
              wide ? "aspect-[16/8]" : "aspect-[4/3]",
            )}
          >
            <span aria-hidden className="display text-6xl text-foreground/20">
              {item.title.charAt(0)}
            </span>
          </div>
        )}
        <span className="absolute right-4 top-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-signal text-signal-foreground opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
      </div>

      <div className="mt-5 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="label-mono text-muted-foreground">{clientLabel}</p>
          <h3
            className={cn(
              "display-sm mt-3 text-balance transition-colors",
              wide ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
            )}
          >
            {item.title}
          </h3>
          {item.summary ? (
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
              {item.summary}
            </p>
          ) : null}
        </div>
        <span className="label-mono shrink-0 text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </Link>
  );
}
