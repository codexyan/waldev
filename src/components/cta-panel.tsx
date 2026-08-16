import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Panel ajakan bertindak dengan warna terbalik: tinta pekat di mode terang,
 * kertas terang di mode gelap. Dipakai di beranda dan halaman detail.
 */
export function CtaPanel({
  eyebrow = "Langkah berikutnya",
  title,
  body,
  ctaLabel = "Mulai proyek",
  ctaHref = "/collaboration",
  secondaryLabel = "Atau kirim pesan singkat",
  secondaryHref = "/contact",
}: {
  eyebrow?: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <div
      className="bg-noise on-ink spotlight relative overflow-hidden rounded-xl bg-foreground px-7 py-16 text-background sm:px-14 sm:py-24"
      data-reveal
      data-spotlight
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 hidden sm:block"
      >
        <div className="animate-drift h-80 w-80 rounded-full bg-signal/25 blur-[110px]" />
      </div>

      <div className="relative">
        <span className="label-mono inline-flex items-center gap-2 text-background/60">
          <span aria-hidden className="h-2 w-2 bg-signal" />
          {eyebrow}
        </span>
        <h2 className="display mt-7 max-w-3xl text-balance text-3xl sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        <p className="mt-6 max-w-xl text-pretty leading-relaxed text-background/70 sm:text-lg">
          {body}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Link href={ctaHref} data-magnetic="0.18" className="inline-block">
            <Button size="xl" variant="signal" className="group">
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href={secondaryHref} className="link-sweep text-sm font-medium text-background/80">
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
