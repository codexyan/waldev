import type { Metadata } from "next";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Eyebrow } from "@/components/ui/section-heading";
import { SHELL } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pesan terkirim",
  robots: { index: false, follow: false },
  alternates: { canonical: "/kontak/terkirim" },
};

/** Tujuan formulir kontak yang dikirim tanpa JavaScript dan berhasil (docs/09 §5.4). */
export default function ContactSentPage() {
  return (
    <section className={cn(SHELL, "py-20 sm:py-28")}>
      <Eyebrow>Kontak</Eyebrow>
      <h1 className="display mt-4 text-[2rem] sm:text-4xl">Pesan terkirim</h1>
      <p className="text-muted-foreground mt-5 max-w-xl leading-relaxed text-pretty">
        Terima kasih. Kami membalas lewat email yang Anda tulis di formulir.
      </p>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        <ArrowLink href="/apps">Lihat portofolio</ArrowLink>
        <ArrowLink href="/">Kembali ke beranda</ArrowLink>
      </div>
    </section>
  );
}
