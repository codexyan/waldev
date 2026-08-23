import { createElement } from "react";
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
  // createElement, bukan `const Icon = ...` lalu `<Icon />`: pola kedua terbaca
  // seperti membuat komponen baru di setiap render, padahal ini hanya pencarian
  // dari peta statis.
  return createElement(serviceIconFor(slug), { className, "aria-hidden": true });
}
