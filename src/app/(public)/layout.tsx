import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { RevealInit } from "@/components/reveal-init";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/social-icons";
import { getMenuItems } from "@/modules/navigation/navigation.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";

const SOCIAL_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Instagram: InstagramIcon,
  LinkedIn: LinkedinIcon,
  GitHub: GithubIcon,
};

export const dynamic = "force-dynamic";

const DEFAULT_HEADER = [
  { label: "Services", url: "/services" },
  { label: "Portfolio", url: "/portfolio" },
  { label: "Articles", url: "/articles" },
  { label: "About", url: "/about" },
];

const DEFAULT_FOOTER = [
  { label: "Privacy", url: "/privacy-policy" },
  { label: "Terms", url: "/terms-of-service" },
  { label: "Contact", url: "/contact" },
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
  ].filter((s) => s.url);

  return (
    <div className="flex min-h-dvh flex-col">
      <RevealInit />
      {/* Tanpa JS, konten [data-reveal] harus tetap terlihat */}
      <noscript>
        <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      <SiteHeader brand={brand} nav={nav} />

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-mark.png"
                  alt=""
                  width={211}
                  height={96}
                  className="h-7 w-auto dark:invert"
                />
                <p className="text-lg font-semibold tracking-tight">
                  {brand}
                  <span className="text-primary">.</span>
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {settings.footer_text || settings.tagline}
              </p>
              {socials.length > 0 ? (
                <div className="mt-5 flex gap-3">
                  {socials.map((s) => {
                    const Icon = SOCIAL_ICONS[s.label];
                    return (
                      <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                      >
                        {Icon ? <Icon className="h-4 w-4" /> : <span className="text-xs">{s.label}</span>}
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <nav className="flex flex-col gap-3 sm:items-end">
              {footerNav.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-12 border-t border-border/60 pt-6">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {brand}. {settings.tagline}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
