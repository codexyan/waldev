import type { Metadata } from "next";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Eyebrow } from "@/components/ui/section-heading";
import { SHELL } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pesan belum terkirim",
  robots: { index: false, follow: false },
  alternates: { canonical: "/kontak/gagal" },
};

/** Tujuan formulir kontak yang dikirim tanpa JavaScript dan gagal (docs/09 §5.4). */
export default function ContactFailedPage() {
  return (
    <section className={cn(SHELL, "py-20 sm:py-28")}>
      <Eyebrow>Kontak</Eyebrow>
      <h1 className="display mt-4 text-[2rem] sm:text-4xl">Pesan belum terkirim</h1>
      <p className="text-muted-foreground mt-5 max-w-xl leading-relaxed text-pretty">
        Periksa isian formulir, lalu coba lagi. Nama dan email wajib diisi, dan pesan minimal 10
        karakter. Bila sudah mengirim beberapa pesan, tunggu sekitar satu jam sebelum mencoba lagi.
      </p>
      <div className="mt-8">
        <ArrowLink href="/kontak">Kembali ke formulir</ArrowLink>
      </div>
    </section>
  );
}
