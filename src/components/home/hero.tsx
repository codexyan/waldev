import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { LineReveal } from "@/components/motion/line-reveal";
import { Button } from "@/components/ui/button";
import { HERO_LINES, HERO_MARKED_WORD } from "@/lib/constants";

export interface HeroStat {
  value: number | string;
  suffix?: string;
  label: string;
}

export function Hero({ description, stats }: { description: string; stats: HeroStat[] }) {
  return (
    <section className="bg-noise relative overflow-hidden">
      <div aria-hidden className="bg-grid absolute inset-0" />
      {/* Cahaya sinyal yang bergerak sangat pelan di latar. */}
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 hidden lg:block">
        <div className="animate-drift h-[32rem] w-[32rem] rounded-full bg-signal/20 blur-[140px]" />
      </div>
      <div aria-hidden className="pointer-events-none absolute -left-40 top-64 hidden lg:block">
        <div className="animate-drift h-80 w-80 rounded-full bg-foreground/5 blur-[120px] [animation-delay:-7s]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-14 sm:pt-20 lg:px-10 lg:pb-20">
        <p className="animate-fade-up label-mono flex items-center gap-2.5 text-muted-foreground">
          <span className="pulse-dot" aria-hidden />
          Tersedia untuk proyek baru
        </p>

        <h1 className="display mt-9 max-w-[16ch] text-[clamp(2.5rem,8.5vw,6rem)] leading-[0.96]">
          <LineReveal lines={HERO_LINES} marked={HERO_MARKED_WORD} />
        </h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-end">
          <p className="animate-fade-up max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground [animation-delay:560ms] sm:text-xl">
            {description}
          </p>
          <div className="animate-fade-up flex flex-wrap items-center gap-6 [animation-delay:660ms] lg:justify-end">
            <Link href="/collaboration" data-magnetic="0.18" className="inline-block">
              <Button size="xl" className="group">
                Mulai proyek
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/portfolio" className="link-sweep text-sm font-medium">
              Lihat karya kami
            </Link>
          </div>
        </div>

        {/* Angka ringkas: bukti cepat sebelum pengunjung menggulir. */}
        <dl className="animate-fade-up mt-20 grid grid-cols-2 border-t border-border [animation-delay:780ms] sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="border-border px-0 py-7 sm:px-6 sm:first:pl-0 sm:[&:not(:first-child)]:border-l"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="num block text-4xl font-semibold sm:text-5xl">
                  {typeof stat.value === "number" ? (
                    <CountUp value={stat.value} suffix={stat.suffix ?? ""} />
                  ) : (
                    stat.value
                  )}
                </span>
                <span className="label-mono mt-3 block text-muted-foreground">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div
          aria-hidden
          className="animate-fade-up mt-14 hidden items-center gap-3 [animation-delay:880ms] lg:flex"
        >
          <span className="relative block h-10 w-px bg-border">
            <span className="animate-scroll-hint absolute inset-0 block bg-foreground" />
          </span>
          <span className="label-mono text-muted-foreground">Gulir untuk menjelajah</span>
          <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}
