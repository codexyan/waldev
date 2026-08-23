import type { Metadata } from "next";
import { Clock, FileText, ListChecks, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PointList, type Point } from "@/components/ui/point-list";
import { WA_PESAN, waLink } from "@/lib/whatsapp";
import { CollaborationForm } from "@/modules/leads/components/collaboration-form";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Konsultasi Gratis",
  description:
    "Jawab beberapa pertanyaan singkat, jawaban Anda otomatis tersusun menjadi ringkasan kebutuhan untuk tim WalDev.",
  alternates: { canonical: "/collaboration" },
};

const POINTS: Point[] = [
  {
    icon: ListChecks,
    title: "Terpandu langkah demi langkah",
    body: "Cukup pilih jawaban yang tersedia. Tidak perlu paham istilah teknis atau bingung harus mulai dari mana.",
  },
  {
    icon: FileText,
    title: "Otomatis menjadi ringkasan kebutuhan",
    body: "Jawaban Anda tersusun menjadi dokumen kebutuhan ringkas yang langsung dipahami tim kami.",
  },
  {
    icon: Clock,
    title: "Sekitar 2 menit saja",
    body: "Tiga langkah singkat, lalu tim kami menghubungi Anda dalam 1x24 jam kerja.",
  },
  {
    icon: ShieldCheck,
    title: "Ide Anda aman",
    body: "Detail proyek dan data yang Anda kirim kami jaga kerahasiaannya.",
  },
];

export default async function CollaborationPage() {
  const settings = await getSiteSettings();
  const whatsappHref = waLink(settings.contact_whatsapp, WA_PESAN.umum);

  return (
    <>
      <PageHeader
        eyebrow="Konsultasi Gratis"
        title={["Tidak perlu siapkan", "dokumen apa pun."]}
        description="Jawab beberapa pertanyaan singkat. Sisanya kami yang susun menjadi ringkasan kebutuhan yang rapi, siap dibaca dan ditindaklanjuti."
      />

      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <PointList points={POINTS} />
          </div>

          <div>
            <div className="border-border bg-card rounded-lg border p-7 sm:p-9">
              <CollaborationForm
                whatsappHref={whatsappHref}
                contactEmail={settings.contact_email || null}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
