import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import { Mail } from "lucide-react";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/social-icons";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Eyebrow } from "@/components/ui/section-heading";
import { SHELL } from "@/components/ui/shell";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { listPublishedApps } from "@/modules/apps/app.dal";
import { getMediaPick } from "@/modules/media/media.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tentang",
  description: `Siapa yang membangun ${SITE.name} dan cara menghubunginya.`,
  alternates: { canonical: "/about" },
};

const SOCIAL_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Instagram: InstagramIcon,
};

const KOLOM_FAKTA: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

/** Cerita singkat dari Pengaturan; baris kosong memisahkan paragraf. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const [photo, apps] = await Promise.all([
    getMediaPick(settings.owner_photo_media_id),
    listPublishedApps(),
  ]);

  const brand = settings.brand_name || SITE.name;
  const name = settings.owner_name.trim();
  const bio = paragraphs(settings.owner_bio);
  const story =
    bio.length > 0
      ? bio
      : [
          `${brand} adalah software house yang membangun aplikasi web dan sistem informasi. Semua proyek kami tercatat di portofolio, termasuk yang masih dikerjakan dan yang sudah tidak aktif.`,
        ];

  const lokasi = [settings.location_city, settings.location_region].filter(Boolean).join(", ");
  const facts = [
    lokasi ? { label: "Berbasis di", value: lokasi } : null,
    settings.founded_year ? { label: `${brand} sejak`, value: settings.founded_year } : null,
    { label: "Jumlah proyek", value: String(apps.length) },
  ].filter((fact) => fact !== null);

  const socials = [
    { label: "GitHub", url: settings.social_github },
    { label: "LinkedIn", url: settings.social_linkedin },
    { label: "Instagram", url: settings.social_instagram },
  ].filter((social) => social.url);

  const organisasi = { "@type": "Organization", name: brand, url: SITE.url };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: name
      ? {
          "@type": "Person",
          name,
          ...(bio[0] ? { description: bio[0] } : {}),
          ...(photo ? { image: new URL(photo.url, SITE.url).toString() } : {}),
          ...(socials.length > 0 ? { sameAs: socials.map((social) => social.url) } : {}),
          worksFor: organisasi,
        }
      : organisasi,
  };

  return (
    <>
      <header className="border-border border-b">
        <div className={cn(SHELL, "py-14 sm:py-20")}>
          <div className="flex flex-col-reverse gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>{name ? `Pembuat ${brand}` : "Tentang"}</Eyebrow>
              <h1 className="display mt-4 text-[2rem] text-balance sm:text-4xl lg:text-5xl">
                {name || brand}
              </h1>
              <div className="mt-6 space-y-4">
                {story.map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground leading-relaxed text-pretty">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            {photo?.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.url}
                alt={name ? `Foto ${name}` : ""}
                width={160}
                height={160}
                className="border-border h-32 w-32 shrink-0 rounded-xl border object-cover sm:h-40 sm:w-40"
              />
            ) : null}
          </div>
        </div>
      </header>

      <section className={cn(SHELL, "pt-14")}>
        <dl
          className={cn(
            "divide-border border-border grid divide-y overflow-hidden rounded-xl border sm:divide-x sm:divide-y-0",
            KOLOM_FAKTA[facts.length],
          )}
        >
          {facts.map((fact) => (
            <div key={fact.label} className="bg-card px-6 py-5">
              <dt className="text-faint text-xs">{fact.label}</dt>
              <dd className="display-sm mt-1.5 text-[0.9375rem]">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={cn(SHELL, "py-16 sm:py-24")}>
        {settings.contact_email || socials.length > 0 ? (
          <>
            <Eyebrow>Kontak</Eyebrow>
            <h2 className="display mt-3 max-w-2xl text-2xl text-balance sm:text-[1.75rem]">
              Ada pertanyaan tentang proyek kami?
            </h2>
            {settings.contact_email ? (
              <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                Kirim email ke{" "}
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="text-link hover:text-link-hover inline-flex items-center gap-1.5 font-medium break-all"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {settings.contact_email}
                </a>
              </p>
            ) : null}
            {socials.length > 0 ? (
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                {socials.map((social) => {
                  const Icon = SOCIAL_ICONS[social.label];
                  return (
                    <li key={social.label}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-heading inline-flex items-center gap-2 transition-colors"
                      >
                        {Icon ? <Icon className="h-4 w-4" /> : null}
                        {social.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </>
        ) : null}
        <p className={settings.contact_email || socials.length > 0 ? "mt-10" : undefined}>
          <ArrowLink href="/apps">Lihat portofolio</ArrowLink>
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
