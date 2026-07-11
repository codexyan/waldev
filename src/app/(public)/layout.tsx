import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
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
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {brand}
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/collaboration" className="hidden sm:block">
              <Button size="sm">Start a Project</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <p className="text-lg font-semibold tracking-tight">{brand}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {settings.footer_text || settings.tagline}
              </p>
              {socials.length > 0 ? (
                <div className="mt-4 flex gap-4">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            <nav className="flex gap-6">
              {footerNav.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="mt-10 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {brand}. {settings.tagline}
          </p>
        </div>
      </footer>
    </div>
  );
}
