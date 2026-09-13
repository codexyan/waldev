import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { SECTION, SHELL } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

/**
 * Ajakan kontak di akhir halaman publik (docs/09 §5.1 dan §5.2), seperti penutup situs
 * software house acuan. Tanpa formulir dan WhatsApp: tombolnya membuka email, dan
 * alamatnya ikut ditulis supaya bisa disalin. Pemanggil hanya merender komponen ini bila
 * email kontak diisi, supaya tombolnya tidak mati.
 */
export function ContactCta({
  email,
  title = "Punya proyek yang ingin dibicarakan?",
  description = "Ceritakan kebutuhan aplikasi web atau sistem informasi Anda lewat email ke kami.",
}: {
  email: string;
  title?: string;
  description?: string;
}) {
  return (
    <section id="kontak" className={cn(SHELL, SECTION, "border-border scroll-mt-14 border-t")}>
      <SectionHeading title={title} description={description} />
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={`mailto:${email}`}
          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
        >
          Hubungi kami
        </a>
        <span className="text-muted-foreground text-sm break-all">{email}</span>
      </div>
    </section>
  );
}
