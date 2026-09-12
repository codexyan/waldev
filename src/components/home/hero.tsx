import { ArrowLink } from "@/components/ui/arrow-link";
import { buttonVariants } from "@/components/ui/button";
import { SHELL } from "@/components/ui/shell";
import { StaticLink } from "@/components/ui/static-link";
import { cn } from "@/lib/utils";

/** Aplikasi tayang yang dipajang di hero beserta tangkapan layar utamanya. */
export interface HeroShowcase {
  name: string;
  slug: string;
  coverUrl: string;
}

/** Hero beranda (docs/09 §5.1): judul, pengantar, ajakan, lalu tangkapan layar. */
export function Hero({
  title,
  lead,
  email,
  showcase,
}: {
  title: string;
  lead: string;
  /** Null selama email kontak belum diisi di Pengaturan. */
  email: string | null;
  /** Null bila belum ada aplikasi tayang yang punya tangkapan layar utama. */
  showcase: HeroShowcase | null;
}) {
  return (
    <section className={cn(SHELL, "pt-16 pb-16 sm:pt-24")}>
      <h1 className="display max-w-3xl text-[2rem] text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h1>

      <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed text-pretty">{lead}</p>

      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
        <StaticLink
          href="#aplikasi"
          className={cn(buttonVariants({ size: "xl" }), "w-full sm:w-auto")}
        >
          Lihat aplikasi
        </StaticLink>
        {email ? <ArrowLink href={`mailto:${email}`}>Hubungi lewat email</ArrowLink> : null}
      </div>

      {showcase ? <Showcase item={showcase} /> : null}
    </section>
  );
}

/**
 * Tangkapan layar dalam bingkai jendela. Seluruh blok hilang bila belum ada
 * aplikasi bersampul, supaya hero berhenti di tombol, bukan di kotak kosong.
 */
function Showcase({ item }: { item: HeroShowcase }) {
  return (
    <figure className="mt-14">
      <StaticLink
        href={`/apps/${item.slug}`}
        className="border-border bg-surface hover:border-primary/40 block rounded-xl border p-2 transition-colors"
        aria-label={`Lihat halaman ${item.name}`}
      >
        <div className="border-border bg-card overflow-hidden rounded-lg border">
          <div className="border-border flex items-center gap-3 border-b px-3 py-2.5">
            <span className="flex shrink-0 gap-1.5" aria-hidden>
              <span className="bg-border h-2.5 w-2.5 rounded-full" />
              <span className="bg-border h-2.5 w-2.5 rounded-full" />
              <span className="bg-border h-2.5 w-2.5 rounded-full" />
            </span>
            <span className="bg-muted text-faint mx-auto max-w-[60%] truncate rounded-md px-3 py-1 text-xs">
              {item.name}
            </span>
            <span className="w-[3.375rem] shrink-0" aria-hidden />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.coverUrl}
            alt={`Tangkapan layar ${item.name}`}
            /* Gambar paling atas halaman: dimuat lebih awal, bukan malas. */
            fetchPriority="high"
            decoding="async"
            className="aspect-[16/9] w-full object-cover object-top"
          />
        </div>
      </StaticLink>

      <figcaption className="text-faint mt-3 text-xs">
        Aplikasi terbaru ·{" "}
        <StaticLink href={`/apps/${item.slug}`} className="link text-muted-foreground">
          {item.name}
        </StaticLink>
      </figcaption>
    </figure>
  );
}
