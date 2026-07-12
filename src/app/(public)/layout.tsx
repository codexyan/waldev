import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { getMenuItems } from "@/modules/navigation/navigation.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";

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
      <SiteHeader brand={brand} nav={nav} />

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <p className="text-lg font-semibold tracking-tight">
                {brand}
                <span className="text-primary">.</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {settings.footer_text || settings.tagline}
              </p>
              {socials.length > 0 ? (
                <div className="mt-5 flex gap-5">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {s.label}
                    </a>
                  ))}
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
