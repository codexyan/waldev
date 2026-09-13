import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { StaticLink } from "@/components/ui/static-link";
import { SITE } from "@/lib/constants";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: `Kebijakan privasi ${SITE.name}: data yang dikirim lewat formulir kontak dan cara memakainya.`,
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
        description="Singkatnya: data pribadi yang disimpan hanya isian formulir kontak, dan hanya dipakai untuk membalas pesan Anda."
      />

      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <div className="prose max-w-none">
          <p>
            {brand} adalah portofolio proyek aplikasi web. Halaman ini menjelaskan data apa saja yang
            terlibat saat Anda membuka situs ini atau mengirim pesan lewat formulir kontak.
          </p>

          <h2>Formulir kontak</h2>
          <p>
            Halaman <StaticLink href="/kontak">Kontak</StaticLink> berisi formulir untuk nama, email,
            dan pesan. Isian itu disimpan di database {brand} di Cloudflare dan hanya dibaca
            pengelola situs untuk membalas pesan Anda. Alamat email Anda tidak ditampilkan di situs.
          </p>
          <p>
            Untuk mencegah pesan spam, alamat IP pengirim dipakai sebagai penghitung jumlah kiriman
            selama satu jam. Alamat IP itu tidak disimpan bersama pesan.
          </p>

          <h2>Tidak ada akun</h2>
          <p>Situs ini tidak punya pendaftaran akun maupun kolom komentar.</p>

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
            Beberapa halaman proyek menyertakan video YouTube. Sebelum diklik, hanya gambar
            pratinjaunya yang dimuat dari server YouTube. Pemutarnya baru dimuat setelah Anda
            mengklik video, dan sejak saat itu berlaku kebijakan privasi YouTube.
          </p>

          <h2>Pertanyaan</h2>
          <p>
            Pertanyaan soal kebijakan ini atau data yang Anda kirim bisa disampaikan lewat{" "}
            <StaticLink href="/kontak">formulir kontak</StaticLink>.
          </p>
        </div>
      </section>
    </>
  );
}
