import Link from "next/link";
import {
  ArrowRight,
  Check,
  ExternalLink,
  FileText,
  FolderKanban,
  Handshake,
  Inbox,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_BASE } from "@/lib/constants";
import { statusLabel, statusTone } from "@/lib/status";
import { listArticlesAdmin } from "@/modules/articles/article.dal";
import { listCollaborations, listContacts } from "@/modules/leads/lead.dal";
import { listPortfoliosAdmin } from "@/modules/portfolio/portfolio.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";
import { listPublishedTestimonials } from "@/modules/testimonials/testimonial.dal";
import { requireSession } from "@/server/auth/session";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Jarak waktu singkat dalam bahasa Indonesia, misalnya "3 hari lalu". */
function timeAgo(value: Date | null): string {
  if (!value) return "belum pernah";
  const seconds = Math.max(0, Math.floor((Date.now() - value.getTime()) / 1000));
  if (seconds < 60) return "baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan lalu`;
  return `${Math.floor(months / 12)} tahun lalu`;
}

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col border border-border bg-background", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <h2 className="label-mono text-muted-foreground">{title}</h2>
        {action ? (
          <Link
            href={action.href}
            className="group inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-foreground"
          >
            {action.label}
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex flex-1 items-center justify-center px-5 py-12 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export default async function AdminOverviewPage() {
  await requireSession();

  const [articles, portfolios, publishedArticles, collaborations, contacts, settings, testimonials] =
    await Promise.all([
      listArticlesAdmin({ limit: 5 }),
      listPortfoliosAdmin({ limit: 5 }),
      listArticlesAdmin({ limit: 1, status: "published" }),
      listCollaborations(),
      listContacts(),
      getSiteSettings(),
      listPublishedTestimonials(),
    ]);

  const newLeads = collaborations.filter((row) => row.status === "new");
  const newContacts = contacts.filter((row) => row.status === "new");

  const stats: { label: string; value: number; href: string; icon: LucideIcon; alert?: boolean }[] =
    [
      { label: "Tulisan", value: articles.total, href: `${ADMIN_BASE}/articles`, icon: FileText },
      {
        label: "Karya",
        value: portfolios.total,
        href: `${ADMIN_BASE}/portfolio`,
        icon: FolderKanban,
      },
      {
        label: "Prospek baru",
        value: newLeads.length,
        href: `${ADMIN_BASE}/collaboration`,
        icon: Handshake,
        alert: newLeads.length > 0,
      },
      {
        label: "Pesan baru",
        value: newContacts.length,
        href: `${ADMIN_BASE}/contact-messages`,
        icon: Inbox,
        alert: newContacts.length > 0,
      },
    ];

  const hasSocial = Boolean(
    settings.social_instagram || settings.social_linkedin || settings.social_github,
  );

  const checklist: { label: string; done: boolean; href: string; hint: string }[] = [
    {
      label: "Email kontak terisi",
      done: Boolean(settings.contact_email),
      href: `${ADMIN_BASE}/settings`,
      hint: "Ditampilkan di footer dan halaman kontak",
    },
    {
      label: "Nomor WhatsApp terisi",
      done: Boolean(settings.contact_whatsapp),
      href: `${ADMIN_BASE}/settings`,
      hint: "Jalur tercepat bagi calon klien",
    },
    {
      label: "Tautan media sosial",
      done: hasSocial,
      href: `${ADMIN_BASE}/settings`,
      hint: "Tombol sosial di footer baru muncul bila diisi",
    },
    {
      label: "Ada testimoni tayang",
      done: testimonials.length > 0,
      href: `${ADMIN_BASE}/testimonials`,
      hint: "Seksi testimoni di beranda tersembunyi bila kosong",
    },
    {
      label: "Ada tulisan tayang",
      done: publishedArticles.total > 0,
      href: `${ADMIN_BASE}/articles`,
      hint: "Menjaga situs terlihat aktif di mesin pencari",
    },
  ];

  const pending = checklist.filter((item) => !item.done).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Kepala halaman */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="label-mono text-muted-foreground">Panel Admin</p>
          <h1 className="mt-3 text-3xl">Ringkasan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pantau isi situs dan permintaan yang masuk dari satu tempat.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`${ADMIN_BASE}/articles/new`}>
            <Button variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Tulisan
            </Button>
          </Link>
          <Link href={`${ADMIN_BASE}/portfolio/new`}>
            <Button variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Karya
            </Button>
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="group">
              Lihat situs
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Angka ringkas */}
      <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex flex-col gap-4 bg-background p-4 transition-colors duration-300 hover:bg-muted/60 sm:gap-5 sm:p-5"
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-300",
                  stat.alert
                    ? "border-transparent bg-signal text-signal-foreground"
                    : "border-border text-muted-foreground group-hover:text-foreground",
                )}
              >
                <stat.icon className="h-4 w-4" aria-hidden />
              </span>
              <ArrowRight className="h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
            <div>
              <p className="num text-4xl font-semibold">{stat.value}</p>
              <p className="label-mono mt-2.5 text-muted-foreground">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Antrean yang perlu ditindaklanjuti */}
        <Panel
          title="Perlu perhatian"
          action={{ label: "Semua prospek", href: `${ADMIN_BASE}/collaboration` }}
        >
          {newLeads.length === 0 && newContacts.length === 0 ? (
            <EmptyState>Tidak ada permintaan baru. Semua sudah ditangani.</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {newLeads.slice(0, 4).map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`${ADMIN_BASE}/collaboration`}
                    className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/60"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal text-signal-foreground">
                      <Handshake className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium">{lead.name}</span>
                        <Badge variant="signal">Prospek</Badge>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {[lead.projectType, lead.budget].filter(Boolean).join(" · ") || lead.email}
                      </span>
                    </span>
                    <span className="label-mono shrink-0 text-muted-foreground">
                      {timeAgo(lead.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
              {newContacts.slice(0, 4).map((message) => (
                <li key={message.id}>
                  <Link
                    href={`${ADMIN_BASE}/contact-messages`}
                    className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/60"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border">
                      <Inbox className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium">{message.name}</span>
                        <Badge variant="outline">Pesan</Badge>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {message.subject || message.email}
                      </span>
                    </span>
                    <span className="label-mono shrink-0 text-muted-foreground">
                      {timeAgo(message.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Kelengkapan isi situs */}
        <Panel title={`Kelengkapan situs · ${checklist.length - pending} dari ${checklist.length}`}>
          <ul className="divide-y divide-border">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-start gap-4 px-5 py-3.5 transition-colors hover:bg-muted/60"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                      item.done
                        ? "border-transparent bg-foreground text-background"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {item.done ? (
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <X className="h-3.5 w-3.5" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-sm",
                        item.done ? "text-muted-foreground line-through" : "font-medium",
                      )}
                    >
                      {item.label}
                    </span>
                    {!item.done ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.hint}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Tulisan terakhir diperbarui"
          action={{ label: "Semua tulisan", href: `${ADMIN_BASE}/articles` }}
        >
          {articles.rows.length === 0 ? (
            <EmptyState>Belum ada tulisan.</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {articles.rows.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`${ADMIN_BASE}/articles/${article.id}/edit`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/60"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{article.title}</span>
                      <span className="label-mono mt-1 block text-muted-foreground">
                        {timeAgo(article.updatedAt)}
                      </span>
                    </span>
                    <Badge variant={statusTone(article.status)}>
                      {statusLabel(article.status)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Karya terakhir diperbarui"
          action={{ label: "Semua karya", href: `${ADMIN_BASE}/portfolio` }}
        >
          {portfolios.rows.length === 0 ? (
            <EmptyState>Belum ada karya.</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {portfolios.rows.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`${ADMIN_BASE}/portfolio/${project.id}/edit`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/60"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{project.title}</span>
                      <span className="label-mono mt-1 block text-muted-foreground">
                        {project.clientName ?? "Proyek internal"} · {timeAgo(project.updatedAt)}
                      </span>
                    </span>
                    <Badge variant={statusTone(project.status)}>
                      {statusLabel(project.status)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
