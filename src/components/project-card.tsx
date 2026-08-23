import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
 * Kartu proyek: gambar di dalam bingkai tipis, lalu teks di bawahnya.
 *
 * Tidak ada pembesaran gambar, kemiringan, maupun tombol melayang yang muncul
 * saat kursor lewat. Satu-satunya tanda "ini bisa diklik" adalah baris biru di
 * bawah judul — tanda yang sama seperti seluruh tautan lain di situs ini.
 */
export function ProjectCard({
  item,
  index,
  wide = false,
}: {
  item: ProjectCardItem;
  index: number;
  wide?: boolean;
}) {
  // Tanpa nama klien, label "Proyek" hanya mengulang hal yang sudah jelas dan
  // tampil identik di setiap kartu. Lebih baik tidak menampilkan apa pun.
  const clientLabel = item.isConfidential ? "Proyek rahasia" : item.clientName;

  return (
    <Link href={`/portfolio/${item.slug}`} className="group block">
      <div className="border-border bg-surface group-hover:border-primary/40 overflow-hidden rounded-xl border transition-colors">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt=""
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "w-full object-cover object-top",
              wide ? "aspect-[16/8]" : "aspect-[16/10]",
            )}
          />
        ) : (
          <div
            className={cn(
              "flex w-full items-center justify-center",
              wide ? "aspect-[16/8]" : "aspect-[16/10]",
            )}
          >
            <span aria-hidden className="display text-faint text-5xl">
              {item.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        {clientLabel ? <p className="text-faint text-xs">{clientLabel}</p> : null}
        <h3
          className={cn(
            "display-sm text-balance",
            clientLabel ? "mt-1.5" : "",
            wide ? "text-lg sm:text-xl" : "text-base sm:text-lg",
          )}
        >
          {item.title}
        </h3>
        {item.summary ? (
          <p className="text-muted-foreground mt-2 line-clamp-2 max-w-xl leading-relaxed text-pretty">
            {item.summary}
          </p>
        ) : null}
        {/* <span>, bukan komponen tautan: kartu ini sendiri sudah sebuah
            tautan, dan menyarangkan <a> di dalam <a> menghasilkan markup
            yang tidak sah sekaligus dua perhentian tab untuk satu tujuan. */}
        <span className="text-link mt-3 inline-flex items-center gap-1.5 font-medium">
          Baca studi kasus
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
