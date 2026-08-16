import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: `Kebijakan privasi ${SITE.name}: data apa yang kami kumpulkan, untuk apa dipakai, dan bagaimana kami menjaganya.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Kebijakan Privasi"
        description="Ditulis singkat dan jelas, tanpa kalimat berbelit. Kami hanya menyimpan data yang benar benar diperlukan untuk melayani Anda."
      />

      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <div className="prose max-w-none" data-reveal>
          <p>
            {SITE.name} menghormati privasi Anda. Halaman ini menjelaskan data apa yang kami
            kumpulkan, bagaimana data itu digunakan, dan langkah yang kami ambil untuk menjaganya.
          </p>

          <h2>Data yang kami kumpulkan</h2>
          <p>
            Kami hanya mengumpulkan data yang Anda kirimkan secara sukarela melalui formulir kontak
            dan formulir kerja sama, yaitu nama, alamat email, nomor WhatsApp, serta deskripsi
            kebutuhan proyek beserta lampiran yang Anda sertakan.
          </p>

          <h2>Penggunaan data</h2>
          <p>
            Data digunakan semata mata untuk menindaklanjuti permintaan Anda dan berkomunikasi
            seputar layanan kami. Kami tidak menjual, menyewakan, atau menukarkan data Anda kepada
            pihak ketiga mana pun.
          </p>

          <h2>Penyimpanan dan keamanan</h2>
          <p>
            Data disimpan pada infrastruktur Cloudflare dengan akses terbatas hanya untuk tim yang
            berkepentingan. Kami menerapkan langkah keamanan yang wajar untuk melindungi data dari
            akses yang tidak sah.
          </p>

          <h2>Hak Anda</h2>
          <p>
            Anda berhak meminta salinan, koreksi, atau penghapusan data yang pernah Anda kirimkan
            kepada kami. Permintaan tersebut akan kami tindaklanjuti dalam waktu yang wajar.
          </p>

          <h2>Kontak</h2>
          <p>
            Untuk pertanyaan seputar kebijakan ini, silakan hubungi kami melalui halaman Kontak.
          </p>
        </div>
      </section>
    </>
  );
}
