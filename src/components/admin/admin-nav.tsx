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

const GROUPS: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [{ href: "", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Konten",
    items: [
      { href: "/articles", label: "Articles", icon: FileText },
      { href: "/portfolio", label: "Portfolio", icon: FolderKanban },
      { href: "/services", label: "Services", icon: Layers },
      { href: "/media", label: "Media", icon: ImageIcon },
      { href: "/categories", label: "Categories", icon: FolderTree },
      { href: "/tags", label: "Tags", icon: Tag },
    ],
  },
  {
    label: "Relasi",
    items: [
      { href: "/clients", label: "Clients", icon: Building2 },
      { href: "/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/collaboration", label: "Collaboration", icon: Handshake },
      { href: "/contact-messages", label: "Contact", icon: Inbox },
    ],
  },
  {
    label: "Sistem",
    items: [
      { href: "/navigation", label: "Navigation", icon: ListTree },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/users", label: "Users", icon: Users },
      { href: "/roles", label: "Roles", icon: ShieldCheck },
      { href: "/activity-logs", label: "Activity", icon: History },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 space-y-6">
      {GROUPS.map((group) => (
        <div key={group.label ?? "root"}>
          {group.label ? (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
          ) : null}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const href = `${ADMIN_BASE}${item.href}`;
              const active =
                item.href === "" ? pathname === ADMIN_BASE : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
