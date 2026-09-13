import type { Metadata } from "next";
import { ContactCta } from "@/components/contact-cta";
import { ArrowLink } from "@/components/ui/arrow-link";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { SECTION, SHELL } from "@/components/ui/shell";
import { SplitSection } from "@/components/ui/split-section";
import { StaticLink } from "@/components/ui/static-link";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { listPublishedApps, listPublishedTechnologies } from "@/modules/apps/app.dal";
import { AppCard } from "@/modules/apps/components/app-card";
import { listPublishedClients } from "@/modules/clients/client.dal";
import { getMediaPick } from "@/modules/media/media.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tentang",
  description: `${SITE.name} adalah software house yang membangun aplikasi web dan sistem informasi.`,
  alternates: { canonical: "/about" },
};

/** Cerita singkat dari Pengaturan; baris kosong memisahkan paragraf. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/**
 * Halaman Tentang (docs/09 §5.3), profil software house: pernyataan, fakta dari Pengaturan,
 * teknologi yang dipakai proyek, klien, pembuat (bila profilnya diisi), proyek terbaru, lalu
 * ajakan ke formulir kontak. Setiap bagian hanya tampil bila datanya ada, dan alamat email
 * tidak ditampilkan.
 */
export default async function AboutPage() {
  const settings = await getSiteSettings();
  const [photo, apps, clients, technologies] = await Promise.all([
    getMediaPick(settings.owner_photo_media_id),
    listPublishedApps(),
    listPublishedClients(),
    listPublishedTechnologies(),
  ]);

  const brand = settings.brand_name || SITE.name;
  const name = settings.owner_name.trim();
  const bio = paragraphs(settings.owner_bio);
  const hasPhoto = photo?.kind === "image";
  const lokasi = [settings.location_city, settings.location_region].filter(Boolean).join(", ");
  const asal = [lokasi ? `dari ${lokasi}` : "", settings.founded_year ? `sejak ${settings.founded_year}` : ""]
    .filter(Boolean)
    .join(", ");
  const intro = `${brand} adalah software house${asal ? ` ${asal}` : ""}. Semua proyek kami tercatat di portofolio, termasuk yang masih dikerjakan dan yang sudah tidak aktif.`;

  const facts = [
    lokasi ? { label: "Berbasis di", value: lokasi } : null,
    settings.founded_year ? { label: "Berdiri", value: settings.founded_year } : null,
    { label: "Proyek di portofolio", value: String(apps.length) },
  ].filter((fact) => fact !== null);
  const [latest] = apps;

  const organisasi = { "@type": "Organization", name: brand, url: SITE.url };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: name
      ? {
          "@type": "Person",
          name,
          ...(bio[0] ? { description: bio[0] } : {}),
          ...(hasPhoto && photo ? { image: new URL(photo.url, SITE.url).toString() } : {}),
          worksFor: organisasi,
        }
      : organisasi,
  };

  return (
    <>
      <header className={cn(SHELL, "py-14 sm:py-20")}>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <Eyebrow>Tentang</Eyebrow>
            <h1 className="display mt-4 text-[2rem] text-balance sm:text-4xl lg:text-5xl">
              {brand} membangun aplikasi web dan sistem informasi.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl leading-relaxed text-pretty">{intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <StaticLink
                href="/kontak"
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
              >
                Hubungi kami
              </StaticLink>
              <ArrowLink href="/apps">Lihat portofolio</ArrowLink>
            </div>
          </div>

          <dl className="border-border divide-border divide-y border-y lg:col-span-5">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-6 py-4">
                <dt className="text-muted-foreground text-sm">{fact.label}</dt>
                <dd className="display-sm text-right text-[0.9375rem]">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {technologies.length > 0 ? (
        <SplitSection title="Teknologi yang kami pakai">
          <ul className="flex flex-wrap gap-2.5">
            {technologies.map((tech) => (
              <li key={tech} className="border-border bg-card rounded-md border px-3 py-1.5 text-sm">
                {tech}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground mt-4 text-sm">
            Dihimpun dari proyek yang tayang di portofolio.
          </p>
        </SplitSection>
      ) : null}

      {clients.length > 0 ? (
        <SplitSection title="Pernah bekerja sama dengan kami">
          <ul className="flex flex-wrap items-center gap-x-10 gap-y-5">
            {clients.map((client) => {
              const mark = client.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={client.logoUrl}
                  alt={client.name}
                  loading="lazy"
                  decoding="async"
                  className="h-8 w-auto max-w-[9rem] object-contain dark:invert"
                />
              ) : (
                <span className="display-sm text-lg">{client.name}</span>
              );
              return (
                <li key={client.name}>
                  {client.websiteUrl ? (
                    <a
                      href={client.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-link transition-colors"
                    >
                      {mark}
                    </a>
                  ) : (
                    mark
                  )}
                </li>
              );
            })}
          </ul>
        </SplitSection>
      ) : null}

      {name || bio.length > 0 || hasPhoto ? (
        <SplitSection title={`Di balik ${brand}`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {hasPhoto && photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.url}
                alt={name ? `Foto ${name}` : ""}
                width={160}
                height={160}
                loading="lazy"
                decoding="async"
                className="border-border h-28 w-28 shrink-0 rounded-xl border object-cover sm:h-32 sm:w-32"
              />
            ) : null}
            <div className="min-w-0">
              {name ? <p className="display-sm text-xl">{name}</p> : null}
              {bio.length > 0 ? (
                <div className={cn("space-y-4", name && "mt-3")}>
                  {bio.map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground leading-relaxed text-pretty">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </SplitSection>
      ) : null}

      {latest ? (
        <section className={cn(SHELL, SECTION, "border-border border-t")}>
          <SectionHeading title="Proyek terbaru" href="/apps" linkLabel="Lihat semua proyek" />
          <div className="mt-10">
            <AppCard app={latest} wide />
          </div>
        </section>
      ) : null}

      <ContactCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
