import type { Metadata } from "next";
import { Gem, MessageCircleQuestion, Repeat2 } from "lucide-react";
import { CtaPanel } from "@/components/cta-panel";
import { PageHeader } from "@/components/page-header";
import { PointList, type Point } from "@/components/ui/point-list";
import { ProcessTimeline } from "@/components/process-timeline";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/constants";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tentang",
  description: `Tentang ${SITE.name}, studio digital yang merancang dan membangun produk digital dari riset sampai peluncuran.`,
  alternates: { canonical: "/about" },
};

/**
 * Cara kami mengambil keputusan — bukan daftar jaminan.
 *
 * Ketiganya dulu nyaris sama dengan daftar jaminan di beranda (kepastian biaya,
 * kecepatan, kepemilikan kode), sehingga /about hanya mengulang halaman yang
 * baru saja dibaca pengunjung. Sekarang isinya sikap kerja yang tidak muncul
 * di tempat lain.
 */
const PRINCIPLES: Point[] = [
  {
    icon: MessageCircleQuestion,
    title: "Bertanya dulu, membangun kemudian",
    body: "Permintaan pertama jarang sama dengan kebutuhan sebenarnya. Kami menggali dulu apa yang macet di keseharian Anda, karena solusi yang salah tetap salah meski dikerjakan dengan rapi.",
  },
  {
    icon: Gem,
    title: "Sederhana dulu, canggih kalau perlu",
    body: "Fitur ditambahkan karena ada yang memakainya, bukan karena bisa dibuat. Versi pertama sengaja kecil supaya cepat dipakai, cepat dikoreksi, dan tidak membebani anggaran di awal.",
  },
  {
    icon: Repeat2,
    title: "Yang dipakai, bukan yang dipamerkan",
    body: "Ukuran keberhasilan kami bukan tampilan yang enak dipandang di layar presentasi, melainkan tim Anda yang berhenti mengeluh soal alat kerjanya sebulan setelah rilis.",
  },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const brand = settings.brand_name || SITE.name;
  const kota = settings.location_city;
  const provinsi = settings.location_region;
  const tahun = settings.founded_year;

  /* Fakta yang paling dicari pengunjung yang ragu: ini studio beneran atau
     bukan, di mana, dan sudah berapa lama. Sebelumnya /about tidak menyebut
     satu pun di antaranya. Semua dibaca dari Site Settings, tidak di-hardcode,
     dan tiap baris hanya muncul bila nilainya benar-benar terisi. */
  const identitas = [
    kota ? { label: "Berbasis di", value: [kota, provinsi].filter(Boolean).join(", ") } : null,
    tahun ? { label: "Berdiri sejak", value: tahun } : null,
    { label: "Cara kerja", value: "Satu tim, dari awal sampai serah terima" },
  ].filter((item) => item !== null);

  return (
    <>
      <PageHeader
        eyebrow="Tentang Kami"
        title={["Studio kecil,", "standar besar."]}
        description={`${brand} merancang dan membangun website, sistem informasi, dan produk digital lain untuk UMKM, perusahaan, startup, hingga instansi${kota ? `, dikerjakan dari ${kota}` : ""}. Satu tim mengerjakan dari perencanaan sampai peluncuran.`}
      />

      <section className="mx-auto max-w-5xl px-6 pt-14">
        <dl className="divide-border border-border grid divide-y overflow-hidden rounded-xl border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {identitas.map((item) => (
            <div key={item.label} className="bg-card px-6 py-5">
              <dt className="text-faint text-xs">{item.label}</dt>
              <dd className="display-sm mt-1.5 text-[0.9375rem]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Pernyataan sikap, satu-satunya paragraf berukuran judul di halaman ini. */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <Eyebrow>Sikap kami</Eyebrow>
        <p className="display mt-4 max-w-3xl text-xl leading-snug text-balance sm:text-2xl lg:text-[2rem]">
          Produk digital yang baik terasa sederhana bagi penggunanya. Itu hanya terjadi kalau
          kerumitannya sudah diselesaikan lebih dulu di belakang layar.
        </p>
      </section>

      <section className="border-border mx-auto max-w-5xl border-t px-6 py-16 sm:py-24">
        <SectionHeading eyebrow="Prinsip" title="Tiga hal yang menentukan keputusan kami" />
        <PointList points={PRINCIPLES} columns={3} className="mt-10" />
      </section>

      <section className="border-border mx-auto max-w-5xl border-t px-6 py-16 sm:py-24">
        <SectionHeading
          eyebrow="Proses"
          title="Kami tidak menebak-nebak"
          description="Setiap keputusan desain berangkat dari pemahaman atas pengguna dan tujuan bisnis Anda, lalu diuji dan disempurnakan bertahap sampai benar-benar tepat sasaran."
        />
        <div className="mt-10">
          <ProcessTimeline />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-4 sm:pt-24">
        <CtaPanel
          title="Punya proyek dalam pikiran?"
          body="Kami senang mendengar rencana Anda, sekalipun masih berupa gagasan kasar. Obrolan pertama selalu gratis dan tanpa kewajiban apa pun."
        />
      </section>
    </>
  );
}
