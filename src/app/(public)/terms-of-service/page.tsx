import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Ketentuan Layanan",
  description: `Ketentuan layanan ${SITE.name}: ruang lingkup jasa, kepemilikan hasil kerja, dan batasan tanggung jawab.`,
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Ketentuan Layanan"
        description="Aturan main yang berlaku saat Anda menggunakan situs ini dan saat kami bekerja sama dalam sebuah proyek."
      />

      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <div className="prose max-w-none" data-reveal>
          <p>
            Dengan menggunakan situs {SITE.name}, Anda menyetujui ketentuan di bawah ini. Harap
            dibaca dengan saksama sebelum melanjutkan.
          </p>

          <h2>Ruang lingkup layanan</h2>
          <p>
            {SITE.name} menyediakan jasa perancangan dan pengembangan produk digital. Cakupan
            pekerjaan, biaya, dan jadwal setiap proyek disepakati secara terpisah melalui perjanjian
            kerja sama tertulis.
          </p>

          <h2>Kekayaan intelektual</h2>
          <p>
            Seluruh konten dalam situs ini adalah milik {SITE.name} kecuali dinyatakan lain. Hak
            atas hasil pekerjaan proyek beralih kepada klien setelah pelunasan, sesuai ketentuan
            pada kontrak masing masing.
          </p>

          <h2>Tanggung jawab klien</h2>
          <p>
            Klien bertanggung jawab atas keakuratan materi yang diserahkan, termasuk teks, gambar,
            dan data, serta memastikan materi tersebut tidak melanggar hak pihak lain.
          </p>

          <h2>Batasan tanggung jawab</h2>
          <p>
            Situs ini disediakan sebagaimana adanya. Kami tidak bertanggung jawab atas kerugian yang
            timbul dari penggunaan informasi di situs ini di luar perjanjian kerja sama yang berlaku.
          </p>

          <h2>Perubahan ketentuan</h2>
          <p>
            Ketentuan ini dapat diperbarui sewaktu waktu. Versi terbaru yang tayang di halaman ini
            adalah versi yang berlaku.
          </p>
        </div>
      </section>
    </>
  );
}
