import { ArrowLink } from "@/components/ui/arrow-link";
import { cn } from "@/lib/utils";

/** Label mikro di atas judul seksi. Huruf kapital kecil berwarna aksen. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("label text-link", className)}>{children}</p>;
}

/**
 * Kepala seksi: judul, satu kalimat penjelas, dan tautan "lihat semua".
 *
 * Tautannya sengaja menempel di ujung kalimat penjelas, bukan berdiri sendiri
 * di sisi kanan judul. Dengan begitu satu seksi hanya punya satu blok teks
 * yang perlu dibaca, dan judulnya tidak pernah bersaing dengan tautan kecil
 * di seberangnya pada layar sempit.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Lihat semua",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}

      <h2 className="display max-w-2xl text-2xl text-balance sm:text-[1.75rem] lg:text-[2rem]">
        {title}
      </h2>

      {description ? (
        <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed text-pretty">
          {description}
          {href ? (
            <>
              {" "}
              <ArrowLink href={href}>{linkLabel}</ArrowLink>
            </>
          ) : null}
        </p>
      ) : href ? (
        <p className="mt-3">
          <ArrowLink href={href}>{linkLabel}</ArrowLink>
        </p>
      ) : null}
    </div>
  );
}
