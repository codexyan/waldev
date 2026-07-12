import type { Metadata } from "next";
import { Clock, Mail, MessageSquare, type LucideIcon } from "lucide-react";
import { ContactForm } from "@/modules/leads/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hubungi WalDev untuk pertanyaan seputar layanan dan produk digital.",
  alternates: { canonical: "/contact" },
};

const POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: MessageSquare,
    title: "Pertanyaan apa pun",
    body: "Seputar layanan, estimasi, atau sekadar konsultasi ringan.",
  },
  {
    icon: Clock,
    title: "Balasan cepat",
    body: "Kami membalas dalam 1x24 jam kerja.",
  },
  {
    icon: Mail,
    title: "Langsung ke tim",
    body: "Pesan Anda masuk langsung ke tim WalDev, bukan bot.",
  },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div data-reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Kontak</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Contact</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Ada pertanyaan? Kirim pesan dan kami akan segera membalas.
          </p>

          <ul className="mt-10 space-y-6">
            {POINTS.map((point, i) => (
              <li
                key={point.title}
                className="flex gap-4"
                data-reveal
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <point.icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="font-medium tracking-tight">{point.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {point.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal style={{ transitionDelay: "120ms" }}>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
