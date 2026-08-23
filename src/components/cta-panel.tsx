import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { ArrowLink } from "@/components/ui/arrow-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WA_PESAN, waLink } from "@/lib/whatsapp";
import { getSiteSettings } from "@/modules/settings/settings.dal";

/**
 * Panel ajakan penutup setiap halaman.
 *
 * Dulu berupa bidang tinta pekat dengan cahaya dan sorotan kursor. Kini kaki
 * halaman yang memegang peran bidang gelap, jadi panel ini justru harus
 * terang — dua blok hitam bertumpuk akan terbaca sebagai satu massa yang
 * sama dan ajakannya ikut tenggelam.
 *
 * Komponen ini membaca Site Settings sendiri supaya setiap pemanggil tidak
 * perlu meneruskan nomor WhatsApp. `getSiteSettings` dibungkus React `cache()`,
 * jadi beberapa pemanggilan dalam satu render tetap satu pembacaan.
 */
export async function CtaPanel({
  title,
  body,
  ctaHref = "/collaboration",
  waMessage = WA_PESAN.umum,
}: {
  /** Dipertahankan demi pemanggil lama; tidak lagi dirender. */
  eyebrow?: string;
  title: string;
  body: string;
  /** Tujuan tombol cadangan bila nomor WhatsApp belum diisi di CMS. */
  ctaHref?: string;
  waMessage?: string;
}) {
  const settings = await getSiteSettings();
  const whatsappHref = waLink(settings.contact_whatsapp, waMessage);

  return (
    <div className="border-border bg-muted rounded-xl border px-6 py-10 sm:px-10 sm:py-12">
      <h2 className="display max-w-2xl text-2xl text-balance sm:text-[1.75rem]">{title}</h2>
      <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed text-pretty">{body}</p>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
        {whatsappHref ? (
          <>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Chat WhatsApp
            </a>
            <span className="flex items-center gap-2">
              <span className="text-faint">atau</span>
              <ArrowLink href={ctaHref}>Isi kebutuhan terpandu</ArrowLink>
            </span>
          </>
        ) : (
          <>
            <Link href={ctaHref} className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
              Konsultasi gratis
            </Link>
            <span className="flex items-center gap-2">
              <span className="text-faint">atau</span>
              <ArrowLink href="/contact">Kirim pesan</ArrowLink>
            </span>
          </>
        )}
      </div>

      <p className="text-faint mt-5 text-xs">
        Gratis dan tanpa kewajiban lanjut. Penawaran tertulis kami kirim sebelum apa pun dimulai.
      </p>
    </div>
  );
}
