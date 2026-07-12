import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
  FileText,
  FolderKanban,
  Handshake,
  Inbox,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listArticlesAdmin } from "@/modules/articles/article.dal";
import { countNewCollaborations, countNewContacts } from "@/modules/leads/lead.dal";
import { listPortfoliosAdmin } from "@/modules/portfolio/portfolio.dal";
import { ADMIN_BASE } from "@/lib/constants";
import { requireSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireSession();
  const [articles, portfolios, newLeads, newContacts] = await Promise.all([
    listArticlesAdmin({ limit: 1 }),
    listPortfoliosAdmin({ limit: 1 }),
    countNewCollaborations(),
    countNewContacts(),
  ]);

  const stats: { label: string; value: number; href: string; icon: LucideIcon }[] = [
    { label: "Articles", value: articles.total, href: `${ADMIN_BASE}/articles`, icon: FileText },
    {
      label: "Portfolio",
      value: portfolios.total,
      href: `${ADMIN_BASE}/portfolio`,
      icon: FolderKanban,
    },
    { label: "Lead Baru", value: newLeads, href: `${ADMIN_BASE}/collaboration`, icon: Handshake },
    { label: "Pesan Baru", value: newContacts, href: `${ADMIN_BASE}/contact-messages`, icon: Inbox },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Ringkasan aktivitas studio.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`${ADMIN_BASE}/articles/new`}>
            <Button variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Artikel
            </Button>
          </Link>
          <Link href={`${ADMIN_BASE}/portfolio/new`}>
            <Button variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Proyek
            </Button>
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button size="sm">
              Lihat Situs
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <s.icon className="h-4 w-4" aria-hidden />
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-5 text-4xl font-semibold tabular-nums tracking-tight">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
