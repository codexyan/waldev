import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { SECTION, SHELL } from "@/components/ui/shell";
import { StaticLink } from "@/components/ui/static-link";
import { cn } from "@/lib/utils";

/**
 * Ajakan kontak di akhir halaman publik (docs/09 §5.1 sampai §5.3), seperti penutup situs
 * software house acuan. Tombolnya menuju formulir di halaman Kontak; alamat email pemilik
 * sengaja tidak ditampilkan di situs.
 */
export function ContactCta({
  title = "Punya proyek yang ingin dibicarakan?",
  description = "Ceritakan kebutuhan aplikasi web atau sistem informasi Anda lewat formulir kontak.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className={cn(SHELL, SECTION, "border-border border-t")}>
      <SectionHeading title={title} description={description} />
      <div className="mt-8">
        <StaticLink href="/kontak" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
          Hubungi kami
        </StaticLink>
      </div>
    </section>
  );
}
