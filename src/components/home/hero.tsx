import { ArrowLink } from "@/components/ui/arrow-link";
import { buttonVariants } from "@/components/ui/button";
import { SHELL } from "@/components/ui/shell";
import { StaticLink } from "@/components/ui/static-link";
import { cn } from "@/lib/utils";
import type { AppStatus } from "@/modules/apps/app.schema";
import { HeroRakit } from "./hero-rakit";

/** Aplikasi tayang yang dipajang di hero beserta tangkapan layar utamanya. */
export interface HeroShowcase {
  name: string;
  slug: string;
  coverUrl: string;
  status: AppStatus;
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
 * Tangkapan layar aplikasi terbaru. Di layar lebar dirakit sebagai kartu 3D
 * (docs/09 §16); di tempat lain tampil sebagai gambar biasa. Seluruh blok hilang
 * bila belum ada aplikasi bersampul, supaya hero berhenti di tombol.
 */
function Showcase({ item }: { item: HeroShowcase }) {
  return (
    <figure className="mt-14">
      <StaticLink
        href={`/apps/${item.slug}`}
        aria-label={`Lihat halaman ${item.name}`}
        className="block"
      >
        <HeroRakit
          src={item.coverUrl}
          alt={`Tangkapan layar ${item.name}`}
          building={item.status === "building"}
        />
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
