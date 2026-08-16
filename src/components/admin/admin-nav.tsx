"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  FolderKanban,
  FolderTree,
  Handshake,
  History,
  Image as ImageIcon,
  Inbox,
  Layers,
  LayoutDashboard,
  ListTree,
  MessageSquareQuote,
  Settings,
  ShieldCheck,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_BASE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Kelompok menu. Label memakai bahasa Indonesia, sama seperti situs publik. */
const GROUPS: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [{ href: "", label: "Ringkasan", icon: LayoutDashboard }],
  },
  {
    label: "Konten",
    items: [
      { href: "/articles", label: "Tulisan", icon: FileText },
      { href: "/portfolio", label: "Karya", icon: FolderKanban },
      { href: "/services", label: "Layanan", icon: Layers },
      { href: "/media", label: "Media", icon: ImageIcon },
      { href: "/categories", label: "Kategori", icon: FolderTree },
      { href: "/tags", label: "Tag", icon: Tag },
    ],
  },
  {
    label: "Relasi",
    items: [
      { href: "/clients", label: "Klien", icon: Building2 },
      { href: "/testimonials", label: "Testimoni", icon: MessageSquareQuote },
      { href: "/collaboration", label: "Prospek", icon: Handshake },
      { href: "/contact-messages", label: "Pesan", icon: Inbox },
    ],
  },
  {
    label: "Sistem",
    items: [
      { href: "/navigation", label: "Navigasi", icon: ListTree },
      { href: "/settings", label: "Pengaturan", icon: Settings },
      { href: "/users", label: "Pengguna", icon: Users },
      { href: "/roles", label: "Peran", icon: ShieldCheck },
      { href: "/activity-logs", label: "Aktivitas", icon: History },
    ],
  },
];

/** Jumlah antrean per menu, ditampilkan sebagai lencana kecil. */
export interface NavCounts {
  collaboration?: number;
  contacts?: number;
}

export function AdminNav({
  counts,
  onNavigate,
}: {
  counts?: NavCounts;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const badgeFor = (href: string) => {
    if (href === "/collaboration") return counts?.collaboration || 0;
    if (href === "/contact-messages") return counts?.contacts || 0;
    return 0;
  };

  return (
    <nav className="flex flex-col gap-7">
      {GROUPS.map((group) => (
        <div key={group.label ?? "root"} className="flex flex-col gap-1.5">
          {group.label ? (
            <p className="label-mono px-3 pb-1 text-muted-foreground">{group.label}</p>
          ) : null}
          {group.items.map((item) => {
            const href = `${ADMIN_BASE}${item.href}`;
            const active =
              item.href === "" ? pathname === ADMIN_BASE : pathname.startsWith(href);
            const badge = badgeFor(item.href);

            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md py-2 pl-3 pr-2.5 text-sm transition-colors duration-200",
                  active
                    ? "bg-foreground font-medium text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {/* Penanda sinyal pada menu aktif. */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-signal transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="flex-1 truncate">{item.label}</span>
                {badge > 0 ? (
                  <span
                    className={cn(
                      "label-mono flex h-5 min-w-5 items-center justify-center rounded-full px-1.5",
                      active ? "bg-background/20 text-background" : "bg-signal text-signal-foreground",
                    )}
                  >
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
