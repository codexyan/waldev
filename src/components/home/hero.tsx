import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { ArrowLink } from "@/components/ui/arrow-link";
import { buttonVariants } from "@/components/ui/button";
import { SHELL } from "@/components/ui/shell";
import { HERO_TITLE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Karya terbaru yang dipajang sebagai bukti langsung di bawah ajakan. */
export interface HeroShowcase {
  slug: string;
  title: string;
  clientName: string | null;
  isConfidential: boolean;
  thumbnailUrl: string | null;
}

export function Hero({
  description,
  whatsappHref,
  showcase,
}: {
  description: string;
  /** Null selama nomor WhatsApp belum diisi di Site Settings. */
  whatsappHref: string | null;
  /** Undefined bila belum ada karya terbit yang punya gambar sampul. */
  showcase?: HeroShowcase;
}) {
  return (
    <section className={cn(SHELL, "pt-16 pb-16 sm:pt-24")}>
      <h1 className="display max-w-2xl text-[2rem] text-balance sm:text-4xl lg:text-5xl">
        {HERO_TITLE}
      </h1>

      <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed text-pretty">
        {description}
      </p>

      {/* Satu tombol, satu tautan. Dua tombol berdampingan membuat pengunjung
          harus memilih dulu sebelum boleh bergerak; di sini jalur tercepat
          yang berbentuk tombol, jalur kedua cukup berupa teks. */}
      <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
        {whatsappHref ? (
          <>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "xl" }), "w-full sm:w-auto")}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Chat WhatsApp
            </a>
            <span className="flex items-center gap-2">
              <span className="text-faint">atau</span>
              <ArrowLink href="/collaboration">Isi kebutuhan terpandu</ArrowLink>
            </span>
          </>
        ) : (
          <>
            <Link
              href="/collaboration"
              className={cn(buttonVariants({ size: "xl" }), "w-full sm:w-auto")}
            >
              Konsultasi gratis
            </Link>
            <span className="flex items-center gap-2">
              <span className="text-faint">atau</span>
              <ArrowLink href="/contact">Kirim pesan</ArrowLink>
            </span>
          </>
        )}
      </div>

      {showcase?.thumbnailUrl ? <Showcase item={showcase} /> : null}
    </section>
  );
}

/**
 * Tangkapan layar karya terbaru dalam bingkai jendela.
 *
 * Menempati posisi yang sama seperti panel demo pada acuannya: hal pertama
 * yang terlihat setelah ajakan bukan janji, melainkan sesuatu yang sudah jadi.
 * Seluruh blok ini hilang bila belum ada karya bersampul di CMS — lebih baik
 * hero berhenti di tombol daripada memajang kotak kosong.
 */
function Showcase({ item }: { item: HeroShowcase }) {
  const label = item.isConfidential ? "Proyek rahasia" : (item.clientName ?? item.title);

  return (
    <figure className="mt-14">
      <Link
        href={`/portfolio/${item.slug}`}
        className="border-border bg-surface hover:border-primary/40 block rounded-xl border p-2 transition-colors"
        aria-label={`Lihat studi kasus ${item.title}`}
      >
        <div className="border-border bg-card overflow-hidden rounded-lg border">
          <div className="border-border flex items-center gap-3 border-b px-3 py-2.5">
            <span className="flex shrink-0 gap-1.5" aria-hidden>
              <span className="bg-border h-2.5 w-2.5 rounded-full" />
              <span className="bg-border h-2.5 w-2.5 rounded-full" />
              <span className="bg-border h-2.5 w-2.5 rounded-full" />
            </span>
            <span className="bg-muted text-faint mx-auto max-w-[60%] truncate rounded-md px-3 py-1 text-xs">
              {label}
            </span>
            <span className="w-[3.375rem] shrink-0" aria-hidden />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnailUrl ?? ""}
            alt={`Tangkapan layar ${item.title}`}
            /* Gambar paling atas halaman: dimuat lebih awal, bukan malas. */
            fetchPriority="high"
            decoding="async"
            className="aspect-[16/9] w-full object-cover object-top"
          />
        </div>
      </Link>

      <figcaption className="text-faint mt-3 text-xs">
        Karya terbaru ·{" "}
        <Link href={`/portfolio/${item.slug}`} className="link text-muted-foreground">
          {item.title}
        </Link>
      </figcaption>
    </figure>
  );
}
