"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppWindow,
  FileText,
  FolderTree,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  ListTree,
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
      { href: "/apps", label: "Aplikasi", icon: AppWindow },
      { href: "/articles", label: "Tulisan", icon: FileText },
      { href: "/media", label: "Media", icon: ImageIcon },
      { href: "/categories", label: "Kategori", icon: FolderTree },
      { href: "/tags", label: "Tag", icon: Tag },
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

/** Jumlah yang perlu ditindaklanjuti per menu, ditampilkan sebagai lencana kecil. */
export interface NavCounts {
  /** Aplikasi berstatus Sedang dibangun yang lama tanpa catatan. */
  appsNeedingUpdate?: number;
}

export function AdminNav({ counts, onNavigate }: { counts?: NavCounts; onNavigate?: () => void }) {
  const pathname = usePathname();

  const badgeFor = (href: string) => {
    if (href === "/apps") return counts?.appsNeedingUpdate || 0;
    return 0;
  };

  return (
    <nav className="flex flex-col gap-7">
      {GROUPS.map((group) => (
        <div key={group.label ?? "root"} className="flex flex-col gap-1.5">
          {group.label ? (
            <p className="label text-muted-foreground px-3 pb-1">{group.label}</p>
          ) : null}
          {group.items.map((item) => {
            const href = `${ADMIN_BASE}${item.href}`;
            const active = item.href === "" ? pathname === ADMIN_BASE : pathname.startsWith(href);
            const badge = badgeFor(item.href);

            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md py-2 pr-2.5 pl-3 text-sm transition-colors duration-200",
                  active
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {/* Penanda sinyal pada menu aktif. */}
                <span
                  aria-hidden
                  className={cn(
                    "bg-primary absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="flex-1 truncate">{item.label}</span>
                {badge > 0 ? (
                  <span
                    className={cn(
                      "label flex h-5 min-w-5 items-center justify-center rounded-full px-1.5",
                      active
                        ? "bg-background/20 text-background"
                        : "bg-primary text-primary-foreground",
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
