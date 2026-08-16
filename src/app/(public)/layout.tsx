import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowRight, ArrowUp, Mail, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { MotionRuntime } from "@/components/motion/motion-runtime";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/social-icons";
import { Button } from "@/components/ui/button";
import { getMenuItems } from "@/modules/navigation/navigation.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";

const SOCIAL_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Instagram: InstagramIcon,
  LinkedIn: LinkedinIcon,
  GitHub: GithubIcon,
};

export const dynamic = "force-dynamic";

const DEFAULT_HEADER = [
  { label: "Layanan", url: "/services" },
  { label: "Karya", url: "/portfolio" },
  { label: "Jurnal", url: "/articles" },
  { label: "Tentang", url: "/about" },
];

const DEFAULT_FOOTER = [
  { label: "Kebijakan Privasi", url: "/privacy-policy" },
  { label: "Ketentuan Layanan", url: "/terms-of-service" },
  { label: "Kontak", url: "/contact" },
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

  const whatsappHref = settings.contact_whatsapp
    ? `https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <div id="top" className="flex min-h-dvh flex-col">
      <MotionRuntime />
      {/* Tanpa JavaScript, konten [data-reveal] harus tetap terlihat. */}
      <noscript>
        <style>{`[data-reveal]{opacity:1 !important;transform:none !important;clip-path:none !important}`}</style>
      </noscript>

      <SiteHeader brand={brand} nav={nav} />

      <main className="flex-1">{children}</main>

      <footer className="relative mt-24 overflow-hidden border-t border-border">
        {/* Ajakan ringkas, hadir di setiap halaman. */}
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="display max-w-lg text-balance text-2xl sm:text-3xl">
              Mari mulai dari obrolan singkat.
            </p>
            <Link href="/collaboration" className="shrink-0">
              <Button size="lg" className="group">
                Mulai proyek
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-mark.png"
                  alt=""
                  width={211}
                  height={96}
                  className="h-7 w-auto dark:invert"
                />
                <span className="display-sm flex items-baseline gap-1 text-[1.0625rem]">
                  {brand}
                  <span aria-hidden className="h-1.5 w-1.5 bg-signal" />
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {settings.footer_text || settings.description}
              </p>
              {socials.length > 0 ? (
                <div className="mt-6 flex gap-2.5">
                  {socials.map((social) => {
                    const Icon = SOCIAL_ICONS[social.label];
                    return (
                      <a
                        key={social.label}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/40 hover:text-foreground"
                      >
                        {Icon ? (
                          <Icon className="h-4 w-4" />
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
              <p className="label-mono text-muted-foreground">Kontak</p>
              <ul className="mt-5 space-y-3 text-sm">
                {settings.contact_email ? (
                  <li>
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="link-sweep inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden />
                      {settings.contact_email}
                    </a>
                  </li>
                ) : null}
                {whatsappHref ? (
                  <li>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-sweep inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                      {settings.contact_whatsapp}
                    </a>
                  </li>
                ) : null}
                <li>
                  <Link
                    href="/contact"
                    className="link-sweep text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Kirim pesan
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-7 sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {brand}. {settings.tagline}
            </p>
            <a
              href="#top"
              className="link-sweep inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Kembali ke atas
              <ArrowUp className="h-3 w-3" aria-hidden />
            </a>
          </div>
        </div>

        {/* Wordmark raksasa bergaris, tanda tangan visual di ujung halaman. */}
        <div aria-hidden className="select-none overflow-hidden px-6 pb-2 lg:px-10">
          <p className="display text-outline whitespace-nowrap text-[18vw] leading-[0.8]">
            {brand}
          </p>
        </div>
      </footer>
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
      <p className="label-mono text-muted-foreground">{title}</p>
      <ul className="mt-5 space-y-3 text-sm">
        {items.map((item) => (
          <li key={item.url}>
            <Link
              href={item.url}
              className="link-sweep text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
