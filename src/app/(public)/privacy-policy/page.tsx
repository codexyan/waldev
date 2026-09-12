import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SITE } from "@/lib/constants";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: `Kebijakan privasi ${SITE.name}: situs ini tidak meminta data pribadi pengunjung.`,
  alternates: { canonical: "/privacy-policy" },
};

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const brand = settings.brand_name || SITE.name;

  return (
    <>
      <PageHeader
        eyebrow="Privasi"
        title="Kebijakan Privasi"
        description="Singkatnya: situs ini tidak meminta dan tidak menyimpan data pribadi pengunjung."
      />

      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <div className="prose max-w-none">
          <p>
            {brand} adalah portofolio aplikasi web. Halaman ini menjelaskan data apa saja yang
            terlibat saat Anda membuka situs ini.
          </p>

          <h2>Tidak ada formulir atau akun</h2>
          <p>
            Situs ini tidak punya formulir, pendaftaran akun, maupun kolom komentar. Anda tidak
            perlu memberikan nama, email, atau nomor telepon.
          </p>

          <h2>Data teknis</h2>
          <p>
            Situs ini berjalan di Cloudflare. Seperti layanan hosting pada umumnya, Cloudflare dapat
            mencatat data teknis setiap permintaan, misalnya alamat IP dan jenis browser, untuk
            keamanan dan menjaga situs tetap berjalan.
          </p>

          <h2>Cookie dan penyimpanan di browser</h2>
          <p>
            Halaman publik tidak memasang cookie pelacak. Pilihan tampilan terang atau gelap
            disimpan di browser Anda sendiri dan tidak dikirim ke mana pun.
          </p>

          <h2>Video YouTube</h2>
          <p>
            Beberapa halaman aplikasi menyertakan video YouTube. Sebelum diklik, hanya gambar
            pratinjaunya yang dimuat dari server YouTube. Pemutarnya baru dimuat setelah Anda
            mengklik video, dan sejak saat itu berlaku kebijakan privasi YouTube.
          </p>

          <h2>Email</h2>
          <p>
            Bila Anda mengirim email, {brand} hanya memakai alamat dan isi pesan Anda untuk
            membalas.
          </p>

          {settings.contact_email ? (
            <>
              <h2>Kontak</h2>
              <p>
                Pertanyaan soal kebijakan ini bisa dikirim ke{" "}
                <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>.
              </p>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
