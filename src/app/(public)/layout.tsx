import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowUp, Mail, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/social-icons";
import { SHELL } from "@/components/ui/shell";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { WA_PESAN, waLink } from "@/lib/whatsapp";
import { getMenuItems } from "@/modules/navigation/navigation.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";

const SOCIAL_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Instagram: InstagramIcon,
  LinkedIn: LinkedinIcon,
  GitHub: GithubIcon,
};

export const dynamic = "force-dynamic";

/* Slot navigasi paling langka diberikan kepada pintu masuk konversi. "Jurnal"
   turun ke footer: arsip tulisan tidak pernah menjadi alasan orang menghubungi
   studio, sedangkan "Kontak" sebelumnya hanya ada di kaki halaman.
   Catatan: keduanya hanya fallback — begitu admin menyusun menu lewat modul
   Navigasi, tabel `navigation_items` yang menang. */
const DEFAULT_HEADER = [
  { label: "Layanan", url: "/services" },
  { label: "Karya", url: "/portfolio" },
  { label: "Tentang", url: "/about" },
  { label: "Kontak", url: "/contact" },
];

const DEFAULT_FOOTER = [
  { label: "Jurnal", url: "/articles" },
  { label: "Klien", url: "/clients" },
  { label: "Testimoni", url: "/testimonials" },
  { label: "Kebijakan Privasi", url: "/privacy-policy" },
  { label: "Ketentuan Layanan", url: "/terms-of-service" },
];

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, headerItems, footerItems] = await Promise.all([
    getSiteSettings(),
    getMenuItems("header"),
    getMenuItems("footer"),
  ]);

  const brand = settings.brand_name || "WalDev";
  const nav = headerItems.length > 0 ? headerItems : DEFAULT_HEADER;
  const footerNav = footerItems.length > 0 ? footerItems : DEFAULT_FOOTER;
  const socials = [
    { label: "Instagram", url: settings.social_instagram },
    { label: "LinkedIn", url: settings.social_linkedin },
    { label: "GitHub", url: settings.social_github },
  ].filter((social) => social.url);

  const whatsappHref = waLink(settings.contact_whatsapp, WA_PESAN.umum);
  const lokasi = [settings.location_city, settings.location_region].filter(Boolean).join(", ");

  /* Data terstruktur organisasi. Alamat sengaja hanya sampai tingkat kota dan
     provinsi — alamat jalan tidak diketahui, dan schema.org tidak mewajibkannya.
     Berguna untuk pencarian lokal seperti "jasa pembuatan website Banjarmasin". */
  const organisasiJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: brand,
    description: settings.description,
    url: SITE.url,
    ...(settings.founded_year ? { foundingDate: settings.founded_year } : {}),
    ...(settings.contact_email ? { email: settings.contact_email } : {}),
    ...(settings.contact_whatsapp ? { telephone: settings.contact_whatsapp } : {}),
    ...(settings.location_city
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: settings.location_city,
            ...(settings.location_region ? { addressRegion: settings.location_region } : {}),
            addressCountry: "ID",
          },
        }
      : {}),
    ...(socials.length > 0 ? { sameAs: socials.map((social) => social.url) } : {}),
  };

  return (
    <div id="top" className="site flex min-h-dvh flex-col">
      <a
        href="#konten"
        className="bg-primary text-primary-foreground sr-only rounded-md px-4 py-2 font-medium focus:not-sr-only focus:absolute focus:top-3 focus:left-6 focus:z-[60]"
      >
        Lompat ke konten
      </a>

      <SiteHeader brand={brand} nav={nav} whatsappHref={whatsappHref} />

      <main id="konten" className="flex-1">
        {children}
      </main>

      {/* Kaki halaman sebagai bidang tinta pekat — satu-satunya blok gelap di
          seluruh situs, sekaligus penanda bahwa halaman sudah habis. Isinya
          murni navigasi dan kontak; ajakan bertindak cukup sekali di penutup
          tiap halaman. */}
      <footer className="bg-ink text-ink-muted mt-20">
        <div className={cn(SHELL, "py-14")}>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-mark.png"
                  alt=""
                  width={211}
                  height={96}
                  loading="lazy"
                  decoding="async"
                  className="h-6 w-auto invert"
                />
                <span className="text-ink-foreground text-[0.9375rem] font-semibold tracking-tight">
                  {brand}
                </span>
              </div>
              <p className="mt-4 max-w-xs leading-relaxed">
                {settings.footer_text || settings.description}
              </p>
              {/* Tempat dan usia studio: dua hal pertama yang dicari pengunjung
                  yang ragu apakah ini usaha nyata. Hadir di setiap halaman. */}
              {lokasi || settings.founded_year ? (
                <p className="mt-4 text-xs">
                  {[lokasi, settings.founded_year ? `sejak ${settings.founded_year}` : ""]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              {socials.length > 0 ? (
                <div className="mt-6 flex gap-4">
                  {socials.map((social) => {
                    const Icon = SOCIAL_ICONS[social.label];
                    return (
                      <a
                        key={social.label}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="hover:text-ink-foreground transition-colors"
                      >
                        {Icon ? (
                          <Icon className="h-[18px] w-[18px]" />
                        ) : (
                          <span className="text-xs">{social.label}</span>
                        )}
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <FooterColumn title="Jelajahi" items={nav} />
            <FooterColumn title="Informasi" items={footerNav} />

            <div>
              <p className="label text-ink-foreground/60">Kontak</p>
              <ul className="mt-4 space-y-2.5">
                {whatsappHref ? (
                  <li>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-ink-foreground inline-flex items-center gap-2 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                      {settings.contact_whatsapp}
                    </a>
                  </li>
                ) : null}
                {settings.contact_email ? (
                  <li>
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="hover:text-ink-foreground inline-flex items-center gap-2 transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden />
                      {settings.contact_email}
                    </a>
                  </li>
                ) : null}
                <li>
                  <Link href="/contact" className="hover:text-ink-foreground transition-colors">
                    Kirim pesan
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {brand}. {settings.tagline}
            </p>
            <a
              href="#top"
              className="hover:text-ink-foreground inline-flex items-center gap-1.5 transition-colors"
            >
              Kembali ke atas
              <ArrowUp className="h-3 w-3" aria-hidden />
            </a>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisasiJsonLd) }}
      />
    </div>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; url: string }[];
}) {
  return (
    <div>
      <p className="label text-ink-foreground/60">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.url}>
            <Link href={item.url} className="hover:text-ink-foreground transition-colors">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
