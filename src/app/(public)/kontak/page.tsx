import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Eyebrow } from "@/components/ui/section-heading";
import { SHELL } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi WalDev lewat formulir kontak untuk membicarakan aplikasi web atau sistem informasi.",
  alternates: { canonical: "/kontak" },
};

/**
 * Halaman Kontak (docs/09 §5.4). Satu-satunya jalur menghubungi WalDev dari situs: alamat
 * email pemilik sengaja tidak ditampilkan di mana pun.
 */
export default function ContactPage() {
  return (
    <section className={cn(SHELL, "py-14 sm:py-20")}>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <Eyebrow>Kontak</Eyebrow>
          <h1 className="display mt-4 text-[2rem] text-balance sm:text-4xl lg:text-5xl">
            Punya proyek yang ingin dibicarakan?
          </h1>
          <p className="text-muted-foreground mt-6 max-w-md leading-relaxed text-pretty">
            Ceritakan kebutuhan aplikasi web atau sistem informasi Anda. Kami membalas lewat email
            yang Anda tulis di formulir.
          </p>
        </div>
        <div className="min-w-0 lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
