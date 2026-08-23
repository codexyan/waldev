import { Eyebrow } from "@/components/ui/section-heading";
import { SHELL } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

/**
 * Kepala halaman: label kecil, judul, lalu satu paragraf pengantar.
 *
 * Tidak ada latar bertekstur, cahaya, maupun judul yang naik dari balik
 * topeng — hanya teks di atas kertas kosong, dipisahkan garis tipis dari isi
 * halaman. Bentuknya sengaja sama persis dengan hero beranda supaya seluruh
 * situs terbaca sebagai satu dokumen.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  /** Beberapa baris digabung menjadi satu kalimat; pemenggalannya diserahkan ke browser. */
  title: string | string[];
  description?: string;
  children?: React.ReactNode;
}) {
  const heading = Array.isArray(title) ? title.join(" ") : title;

  return (
    <header className="border-border border-b">
      <div className={cn(SHELL, "py-14 sm:py-20")}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="display mt-4 max-w-3xl text-[2rem] text-balance sm:text-4xl lg:text-5xl">
          {heading}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-5 max-w-2xl leading-relaxed text-pretty">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </header>
  );
}
