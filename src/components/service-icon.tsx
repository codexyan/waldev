import {
  Bot,
  Database,
  Globe,
  LayoutDashboard,
  Puzzle,
  Rocket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/** Peta slug layanan → ikon. Layanan baru tanpa entri memakai fallback Sparkles. */
const ICONS: Record<string, LucideIcon> = {
  "website-development": Globe,
  "landing-page-company-profile": Rocket,
  "dashboard-admin-panel": LayoutDashboard,
  "sistem-informasi": Database,
  "ai-integration-automation": Bot,
  "custom-software-consulting": Puzzle,
};

export function serviceIconFor(slug: string): LucideIcon {
  return ICONS[slug] ?? Sparkles;
}

export function ServiceIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = serviceIconFor(slug);
  return <Icon className={className} aria-hidden />;
}
