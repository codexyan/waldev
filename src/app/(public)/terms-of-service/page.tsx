import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Ketentuan layanan ${SITE.name}.`,
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Terms of Service</h1>
      <div className="prose mt-8 max-w-none">
        <p>
          Dengan menggunakan situs {SITE.name}, Anda menyetujui ketentuan berikut. Harap baca
          dengan saksama.
        </p>
        <h2>Layanan</h2>
        <p>
          {SITE.name} menyediakan jasa pengembangan produk digital. Ruang lingkup, biaya, dan
          jadwal setiap proyek disepakati secara terpisah melalui perjanjian kerja sama.
        </p>
        <h2>Kekayaan intelektual</h2>
        <p>
          Seluruh konten dalam situs ini adalah milik {SITE.name} kecuali dinyatakan lain.
          Hak atas hasil pekerjaan proyek diatur dalam kontrak masing-masing.
        </p>
        <h2>Batasan tanggung jawab</h2>
        <p>
          Situs ini disediakan &quot;sebagaimana adanya&quot;. Kami tidak bertanggung jawab atas
          kerugian yang timbul dari penggunaan informasi di situs ini.
        </p>
        <h2>Perubahan</h2>
        <p>Ketentuan ini dapat diperbarui sewaktu-waktu tanpa pemberitahuan sebelumnya.</p>
      </div>
    </section>
  );
}
