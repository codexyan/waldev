"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_BASE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "", label: "Overview" },
  { href: "/articles", label: "Articles" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/media", label: "Media" },
  { href: "/categories", label: "Categories" },
  { href: "/tags", label: "Tags" },
  { href: "/collaboration", label: "Collaboration" },
  { href: "/contact-messages", label: "Contact" },
  { href: "/users", label: "Users" },
  { href: "/roles", label: "Roles" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 flex flex-col gap-1">
      {NAV.map((item) => {
        const href = `${ADMIN_BASE}${item.href}`;
        const active = item.href === "" ? pathname === ADMIN_BASE : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
