import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Kebijakan privasi ${SITE.name}.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
      <div className="prose mt-8 max-w-none">
        <p>
          {SITE.name} menghormati privasi Anda. Kebijakan ini menjelaskan bagaimana kami
          mengumpulkan, menggunakan, dan melindungi data yang Anda berikan.
        </p>
        <h2>Data yang kami kumpulkan</h2>
        <p>
          Kami hanya mengumpulkan data yang Anda kirimkan secara sukarela melalui formulir kontak
          dan kerja sama, seperti nama, email, nomor WhatsApp, dan deskripsi kebutuhan proyek.
        </p>
        <h2>Penggunaan data</h2>
        <p>
          Data digunakan semata-mata untuk menindaklanjuti permintaan Anda dan berkomunikasi
          seputar layanan kami. Kami tidak menjual data Anda kepada pihak ketiga.
        </p>
        <h2>Keamanan</h2>
        <p>
          Kami menerapkan langkah keamanan yang wajar untuk melindungi data Anda dari akses yang
          tidak sah.
        </p>
        <h2>Kontak</h2>
        <p>
          Untuk pertanyaan seputar kebijakan ini, silakan hubungi kami melalui halaman Contact.
        </p>
      </div>
    </section>
  );
}
