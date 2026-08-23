import type { Metadata } from "next";
import { Clock, Mail, MessageCircle, MessageSquare, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PointList, type Point } from "@/components/ui/point-list";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WA_PESAN, waLink } from "@/lib/whatsapp";
import { ContactForm } from "@/modules/leads/components/contact-form";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi WalDev untuk pertanyaan seputar layanan, estimasi biaya, atau sekadar konsultasi ringan.",
  alternates: { canonical: "/contact" },
};

const POINTS: Point[] = [
  {
    icon: MessageSquare,
    title: "Pertanyaan apa pun boleh",
    body: "Seputar layanan, perkiraan biaya, pilihan teknologi, atau sekadar meminta pendapat sebelum mengambil keputusan.",
  },
  {
    icon: Clock,
    title: "Dibalas dalam 1x24 jam kerja",
    body: "Pesan yang masuk pada hari kerja kami balas paling lambat keesokan harinya.",
  },
  {
    icon: Mail,
    title: "Langsung ke tim, bukan bot",
    body: "Pesan Anda dibaca dan dijawab oleh orang yang nantinya mengerjakan proyeknya.",
  },
  {
    icon: ShieldCheck,
    title: "Data Anda kami jaga",
    body: "Detail yang Anda kirim hanya dipakai untuk menindaklanjuti permintaan ini.",
  },
];

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const whatsappHref = waLink(settings.contact_whatsapp, WA_PESAN.umum);

  return (
    <>
      <PageHeader
        eyebrow="Kontak"
        title={["Mari mulai dari", "sebuah pesan."]}
        description="Tidak perlu formal. Ceritakan saja apa yang sedang Anda pikirkan, kami balas dengan jawaban yang jujur dan mudah dipahami."
      />

      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            {/* Di halaman bernama Kontak, kanal tercepat tidak boleh jadi elemen
                terlemah. Sebelumnya WhatsApp hanya tautan teks di bawah empat
                kartu; sekarang ia yang pertama terlihat. */}
            {whatsappHref ? (
              <div className="border-border bg-muted/40 mb-6 rounded-lg border p-5">
                <p className="text-sm font-medium">Butuh jawaban cepat?</p>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  WhatsApp adalah jalur tercepat. Tidak perlu mengisi apa pun.
                </p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: "lg" }), "mt-4 gap-1.5")}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Chat WhatsApp
                </a>
              </div>
            ) : null}

            <PointList points={POINTS} />

            {settings.contact_email ? (
              <div className="border-border mt-10 border-t pt-8">
                <p className="label text-muted-foreground">Lewat surel</p>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="display-sm link mt-5 block w-fit text-xl"
                >
                  {settings.contact_email}
                </a>
              </div>
            ) : null}
          </div>

          <div>
            <div className="border-border bg-card rounded-lg border p-7 sm:p-9">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
