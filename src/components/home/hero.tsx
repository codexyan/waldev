import { ArrowLink } from "@/components/ui/arrow-link";
import { buttonVariants } from "@/components/ui/button";
import { SHELL } from "@/components/ui/shell";
import { StaticLink } from "@/components/ui/static-link";
import { cn } from "@/lib/utils";
import { HeroRakit } from "./hero-rakit";

/**
 * Gambar hero: dari Pengaturan › Hero beranda, atau tangkapan layar proyek terbaru
 * yang punya gambar dan masih aktif.
 */
export interface HeroShowcase {
  imageUrl: string;
  alt: string;
  /** "Proyek terbaru" atau "Proyek unggulan"; null bila tidak ada proyek terkait. */
  label: string | null;
  name: string | null;
  /** Halaman aplikasi yang dituju saat gambar diklik. */
  href: string | null;
  /** Aplikasi di hero masih dibangun: tepi kartu 3D tetap berwarna aksen. */
  building: boolean;
}

/** Hero beranda (docs/09 §5.1): judul, pengantar, ajakan, lalu gambar 3D. */
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
  /** Null bila belum ada gambar hero maupun aplikasi bergambar. */
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
          href="#portofolio"
          className={cn(buttonVariants({ size: "xl" }), "w-full sm:w-auto")}
        >
          Lihat portofolio
        </StaticLink>
        {email ? <ArrowLink href={`mailto:${email}`}>Hubungi WalDev</ArrowLink> : null}
      </div>

      {showcase ? <Showcase item={showcase} /> : null}
    </section>
  );
}

/**
 * Gambar hero. Di layar lebar dirakit sebagai kartu 3D di atas lantai cetak biru
 * (docs/09 §16); di tempat lain tampil sebagai gambar biasa.
 */
function Showcase({ item }: { item: HeroShowcase }) {
  const visual = <HeroRakit src={item.imageUrl} alt={item.alt} building={item.building} />;

  return (
    <figure className="mt-14">
      {item.href ? (
        <StaticLink
          href={item.href}
          aria-label={item.name ? `Lihat halaman ${item.name}` : "Lihat halaman proyek"}
          className="block"
        >
          {visual}
        </StaticLink>
      ) : (
        visual
      )}

      {item.label && item.name ? (
        <figcaption className="text-faint mt-3 text-xs">
          {item.label} ·{" "}
          {item.href ? (
            <StaticLink href={item.href} className="link text-muted-foreground">
              {item.name}
            </StaticLink>
          ) : (
            item.name
          )}
        </figcaption>
      ) : null}
    </figure>
  );
}
