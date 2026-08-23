import { ArrowLink } from "@/components/ui/arrow-link";

export interface QuoteItem {
  authorName: string;
  authorRole: string | null;
  company: string | null;
  content: string;
  photoUrl: string | null;
}

/**
 * Satu kutipan klien, ditulis besar dan miring.
 *
 * Sengaja hanya satu. Tiga kartu testimoni berdampingan membuat semuanya
 * terbaca sebagai hiasan yang bisa dilewati; satu kutipan sebesar judul
 * memaksa mata berhenti dan benar-benar membacanya. Sisanya tetap bisa
 * dibuka lewat tautan di bawah.
 */
export function TestimonialQuote({
  quote,
  showAllHref,
}: {
  quote: QuoteItem;
  /** Diisi hanya bila memang ada testimoni lain untuk dibaca. */
  showAllHref?: string;
}) {
  const peran = [quote.authorRole, quote.company].filter(Boolean).join(", ");

  return (
    <figure>
      <div className="flex items-center gap-3">
        {quote.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={quote.photoUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="bg-surface flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-medium"
          >
            {quote.authorName.charAt(0)}
          </span>
        )}
        <p className="text-heading font-medium">
          {quote.authorName}
          {peran ? <span className="text-faint font-normal">{` · ${peran}`}</span> : null}
        </p>
      </div>

      <blockquote className="display-sm mt-6 max-w-3xl text-xl leading-snug text-balance italic sm:text-2xl lg:text-[2rem]">
        “{quote.content}”
      </blockquote>

      {showAllHref ? (
        <figcaption className="mt-6">
          <ArrowLink href={showAllHref}>Baca testimoni lainnya</ArrowLink>
        </figcaption>
      ) : null}
    </figure>
  );
}
