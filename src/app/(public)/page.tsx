import type { Metadata } from "next";
import Link from "next/link";
import { CtaPanel } from "@/components/cta-panel";
import { FaqAccordion, HOME_FAQS } from "@/components/faq-accordion";
import { ClientLogos } from "@/components/home/client-logos";
import { Hero } from "@/components/home/hero";
import { ServiceGrid } from "@/components/home/service-grid";
import { StartSteps } from "@/components/home/start-steps";
import { Stats, type Fact } from "@/components/home/stats";
import { TestimonialQuote } from "@/components/home/testimonial-quote";
import { ValueGrid } from "@/components/home/value-grid";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SECTION, SHELL } from "@/components/ui/shell";
import { DURASI, SITE, WAKTU_BALAS } from "@/lib/constants";
import { hargaTermurah } from "@/lib/harga";
import { cn } from "@/lib/utils";
import { WA_PESAN, waLink } from "@/lib/whatsapp";
import { listPublishedClients } from "@/modules/clients/client.dal";
import { listPublishedPortfolios } from "@/modules/portfolio/portfolio.dal";
import { listActiveServices } from "@/modules/services/service.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";
import { listPublishedTestimonials } from "@/modules/testimonials/testimonial.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* Setiap seksi dipisahkan satu garis tipis selebar kolom isi — satu-satunya
   pembatas yang dipakai di seluruh halaman. */
const BLOCK = cn(SHELL, SECTION, "border-t border-border");

export default async function HomePage() {
  const [settings, services, portfolios, testimonials, clients] = await Promise.all([
    getSiteSettings(),
    listActiveServices(),
    listPublishedPortfolios(),
    listPublishedTestimonials(),
    listPublishedClients(),
  ]);

  const featuredServices = services.slice(0, 6);

  /* Karya yang sudah dipajang besar di hero dikeluarkan dari daftar di bawah.
     Tanpa ini, tangkapan layar yang sama muncul dua kali dalam satu gulir dan
     seksi "contoh hasil kerja" terbaca seperti mengulang hero. */
  const showcase = portfolios.find((item) => item.thumbnailUrl);
  const featuredPortfolio = portfolios.filter((item) => item.slug !== showcase?.slug).slice(0, 3);

  const quote = testimonials[0];

  const whatsappHref = waLink(settings.contact_whatsapp, WA_PESAN.umum);

  /* Harga awal diambil dari CMS, tidak pernah ditulis di kode. Hanya nilai yang
     benar-benar berisi angka rupiah yang dipakai (kolom berisi "Custom" dilewati),
     dan yang dipilih adalah yang TERMURAH — bukan yang pertama menurut urutan CMS,
     yang bisa membuat angka di atas lebih tinggi daripada daftar di bawahnya. */
  const hargaAwal = hargaTermurah(services);

  const facts: Fact[] = [];
  if (hargaAwal) facts.push({ value: hargaAwal, label: "Biaya proyek" });
  facts.push({ value: DURASI[0].waktu, label: "Halaman promosi" });
  facts.push({ value: WAKTU_BALAS, label: "Balasan pesan" });

  /* Ditandai untuk mesin pencari supaya jawaban ini bisa muncul langsung di
     hasil pencarian — pertanyaan biaya adalah yang paling sering diketik. */
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <Hero
        description={settings.description || SITE.description}
        whatsappHref={whatsappHref}
        showcase={showcase}
      />

      {clients.length > 0 ? (
        <section className={cn(SHELL, "border-border border-t py-10")}>
          <h2 className="sr-only">Klien kami</h2>
          <ClientLogos clients={clients} />
        </section>
      ) : null}

      {/* Tiga angka yang paling sering ditanyakan, dijawab sebelum diminta. */}
      <section className={cn(SHELL, "border-border border-t py-10 sm:py-14")}>
        <h2 className="sr-only">Angka ringkas</h2>
        <Stats facts={facts} />
      </section>

      {/* 1. Bisa bikin apa, dan kira-kira berapa? */}
      {featuredServices.length > 0 ? (
        <section className={BLOCK}>
          <SectionHeading
            title="Yang bisa kami kerjakan untuk Anda"
            description="Dari halaman perkenalan sederhana sampai sistem yang dipakai puluhan staf setiap hari. Semuanya dikerjakan tim yang sama, dari perencanaan sampai serah terima."
            href="/services"
            linkLabel="Semua layanan"
          />
          <div className="mt-10">
            <ServiceGrid services={featuredServices} />
          </div>
          {hargaAwal ? (
            <p className="text-faint mt-8 max-w-2xl leading-relaxed">
              Angka di atas adalah titik awal, bukan harga mati. Biaya akhir mengikuti jumlah
              halaman dan fitur yang benar-benar Anda butuhkan, dan selalu kami kirim tertulis
              sebelum apa pun dimulai.
            </p>
          ) : null}
        </section>
      ) : null}

      {/* 2. Mana contoh hasil kerjanya? */}
      <section className={BLOCK}>
        <SectionHeading
          title="Contoh hasil kerja kami"
          description="Setiap proyek kami tulis sebagai cerita singkat: masalah yang dihadapi, keputusan yang diambil, dan bagaimana hasilnya dipakai sehari-hari."
          href={featuredPortfolio.length > 0 ? "/portfolio" : undefined}
          linkLabel="Semua karya"
        />
        {featuredPortfolio.length > 0 ? (
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {featuredPortfolio.map((project, index) => (
              <div key={project.slug} className={index === 0 ? "sm:col-span-2" : undefined}>
                <ProjectCard item={project} index={index} wide={index === 0} />
              </div>
            ))}
          </div>
        ) : (
          /* Sebelumnya seksi ini hilang diam-diam saat CMS kosong, menyisakan
             beranda tanpa satu pun bukti kerja. Lebih jujur mengakuinya. */
          <p className="text-muted-foreground mt-6 max-w-xl leading-relaxed">
            Studi kasus terbaru sedang kami siapkan. Sementara itu, kami senang menceritakannya
            langsung —{" "}
            <Link href="/contact" className="link text-link">
              minta contoh proyek serupa
            </Link>{" "}
            dengan kebutuhan Anda.
          </p>
        )}
      </section>

      {/* 3. Apa kata mereka yang sudah bekerja sama? */}
      {quote ? (
        <section className={BLOCK}>
          <h2 className="sr-only">Testimoni klien</h2>
          <TestimonialQuote
            quote={quote}
            showAllHref={testimonials.length > 1 ? "/testimonials" : undefined}
          />
        </section>
      ) : null}

      {/* 4. Apa jaminannya? */}
      <section className={BLOCK}>
        <SectionHeading
          title="Kenapa memilih kami"
          description="Empat hal yang kami pegang di setiap proyek, apa pun ukurannya."
        />
        <div className="mt-10">
          <ValueGrid />
        </div>
      </section>

      {/* 5. Bagaimana cara memulainya, dan berapa lama? */}
      <section className={BLOCK}>
        <SectionHeading
          title="Tiga langkah, tanpa persiapan rumit"
          description="Anda tidak perlu menyiapkan dokumen atau memahami istilah teknis lebih dulu. Cukup ceritakan kondisinya, sisanya kami yang susun."
        />
        <div className="mt-10">
          <StartSteps />
        </div>
      </section>

      {/* 6. Masih ada yang mengganjal? */}
      <section className={BLOCK}>
        <SectionHeading title="Hal yang paling sering ditanyakan" />
        <div className="mt-8">
          <FaqAccordion items={HOME_FAQS} />
        </div>
      </section>

      {/* 7. Satu ajakan penutup, tidak ada blok ajakan lain sesudahnya. */}
      <section className={cn(SHELL, "pt-16 pb-4 sm:pt-24")}>
        <CtaPanel
          title="Ceritakan dulu, tidak perlu langsung memutuskan."
          body={`Kirim pesan singkat, atau isi kebutuhan terpandu dalam dua menit. Kami balas dengan cakupan dan perkiraan biaya yang jelas dalam ${WAKTU_BALAS}.`}
        />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
