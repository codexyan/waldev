import type { Metadata } from "next";
import { Clock, Mail, MessageSquare, ShieldCheck, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/modules/leads/components/contact-form";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi WalDev untuk pertanyaan seputar layanan, estimasi biaya, atau sekadar konsultasi ringan.",
  alternates: { canonical: "/contact" },
};

const POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: MessageSquare,
    title: "Pertanyaan apa pun boleh",
    body: "Seputar layanan, perkiraan biaya, pilihan teknologi, atau sekadar meminta pendapat sebelum mengambil keputusan.",
  },
  {
    icon: Clock,
    title: "Dibalas dalam 1x24 jam",
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
  const whatsappHref = settings.contact_whatsapp
    ? `https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <>
      <PageHeader
        eyebrow="Kontak"
        title={["Mari mulai dari", "sebuah pesan."]}
        marked="pesan."
        description="Tidak perlu formal. Ceritakan saja apa yang sedang Anda pikirkan, kami balas dengan jawaban yang jujur dan mudah dipahami."
      />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <ul className="space-y-px overflow-hidden rounded-lg border border-border bg-border">
              {POINTS.map((point, index) => (
                <li
                  key={point.title}
                  className="group flex gap-5 bg-background p-7 transition-colors duration-500 hover:bg-muted"
                  data-reveal
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border transition-all duration-500 group-hover:border-transparent group-hover:bg-signal group-hover:text-signal-foreground">
                    <point.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="display-sm text-base">{point.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {point.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {settings.contact_email || whatsappHref ? (
              <div className="mt-10 border-t border-border pt-8" data-reveal>
                <p className="label-mono text-muted-foreground">Jalur langsung</p>
                <div className="mt-5 flex flex-col gap-3">
                  {settings.contact_email ? (
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="display-sm link-sweep w-fit text-xl"
                    >
                      {settings.contact_email}
                    </a>
                  ) : null}
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="display-sm link-sweep w-fit text-xl"
                    >
                      WhatsApp {settings.contact_whatsapp}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div data-reveal style={{ transitionDelay: "120ms" }}>
            <div className="rounded-lg border border-border bg-card p-7 sm:p-9">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
