import { SECTION, SHELL } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

/**
 * Seksi dua kolom: judul di kiri dan isi di kanan pada layar lebar, dipakai halaman proyek
 * dan Tentang. Di layar sempit judul berada di atas isi. Garis atasnya selebar kerangka
 * halaman, sama dengan seksi lain.
 */
export function SplitSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(SHELL, SECTION, "border-border border-t", className)}>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <h2 className="display text-2xl text-balance sm:text-[1.75rem] lg:col-span-4">{title}</h2>
        <div className="min-w-0 lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}
