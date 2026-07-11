import Link from "next/link";
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

  const stats = [
    { label: "Articles", value: articles.total, href: `${ADMIN_BASE}/articles` },
    { label: "Portfolio", value: portfolios.total, href: `${ADMIN_BASE}/portfolio` },
    { label: "Lead Baru", value: newLeads, href: `${ADMIN_BASE}/collaboration` },
    { label: "Pesan Baru", value: newContacts, href: `${ADMIN_BASE}/contact-messages` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ringkasan aktivitas studio.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/20"
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{s.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
