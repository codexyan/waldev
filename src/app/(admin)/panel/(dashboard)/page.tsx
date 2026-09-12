import Link from "next/link";
import {
  AppWindow,
  ArrowRight,
  Boxes,
  Check,
  ExternalLink,
  FileText,
  NotebookPen,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_BASE, SITE } from "@/lib/constants";
import { timeAgo } from "@/lib/date";
import { statusLabel, statusTone } from "@/lib/status";
import { cn } from "@/lib/utils";
import {
  NEEDS_UPDATE_AFTER_DAYS,
  listAppsAdmin,
  listAppsForSelect,
  listAppsNeedingUpdate,
} from "@/modules/apps/app.dal";
import { NoteComposer } from "@/modules/apps/components/app-notes";
import { listArticlesAdmin } from "@/modules/articles/article.dal";
import { getSiteSettings } from "@/modules/settings/settings.dal";
import { requireSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

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
    <section className={cn("border-border bg-background flex flex-col border", className)}>
      <div className="border-border flex items-center justify-between gap-4 border-b px-5 py-4">
        <h2 className="label text-muted-foreground">{title}</h2>
        {action ? (
          <Link
            href={action.href}
            className="group hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
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
    <p className="text-muted-foreground flex flex-1 items-center justify-center px-5 py-12 text-center text-sm">
      {children}
    </p>
  );
}

interface ChecklistItem {
  label: string;
  done: boolean;
  hint: string;
  href?: string;
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const content = (
    <>
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
          item.done
            ? "bg-foreground text-background border-transparent"
            : "border-border text-muted-foreground",
        )}
      >
        {item.done ? <Check className="h-3.5 w-3.5" aria-hidden /> : <X className="h-3.5 w-3.5" aria-hidden />}
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
          <span className="text-muted-foreground mt-0.5 block text-xs">{item.hint}</span>
        ) : null}
      </span>
    </>
  );

  const className = "flex items-start gap-4 px-5 py-3.5";
  return item.href ? (
    <Link href={item.href} className={cn(className, "hover:bg-muted/60 transition-colors")}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

export default async function AdminOverviewPage() {
  await requireSession();

  const [apps, appOptions, needingUpdate, articles, settings] = await Promise.all([
    listAppsAdmin({ limit: 100 }),
    listAppsForSelect(),
    listAppsNeedingUpdate(),
    listArticlesAdmin({ limit: 5 }),
    getSiteSettings(),
  ]);

  const building = apps.rows.filter((app) => app.status === "building").length;

  const stats: { label: string; value: number; href: string; icon: LucideIcon; alert?: boolean }[] =
    [
      { label: "Aplikasi", value: apps.total, href: `${ADMIN_BASE}/apps`, icon: AppWindow },
      { label: "Sedang dibangun", value: building, href: `${ADMIN_BASE}/apps`, icon: Boxes },
      {
        label: "Perlu kabar",
        value: needingUpdate.length,
        href: `${ADMIN_BASE}/apps`,
        icon: NotebookPen,
        alert: needingUpdate.length > 0,
      },
      { label: "Tulisan", value: articles.total, href: `${ADMIN_BASE}/articles`, icon: FileText },
    ];

  const settingsHref = `${ADMIN_BASE}/settings`;
  const checklist: ChecklistItem[] = [
    {
      label: "Email kontak terisi",
      done: Boolean(settings.contact_email),
      href: settingsHref,
      hint: "Jalur utama pengunjung untuk menghubungi Anda",
    },
    {
      label: "Tautan media sosial",
      done: Boolean(settings.social_instagram || settings.social_linkedin || settings.social_github),
      href: settingsHref,
      hint: "Ikon sosial baru muncul bila diisi",
    },
    {
      label: "Profil pembuat lengkap",
      done: Boolean(settings.owner_name && settings.owner_photo_media_id && settings.owner_bio),
      href: settingsHref,
      hint: "Nama, foto, dan cerita singkat untuk halaman Tentang",
    },
    {
      label: "Kalimat pengantar beranda",
      done: Boolean(settings.home_intro),
      href: settingsHref,
      hint: "Satu kalimat di atas daftar arsip",
    },
    {
      label: "Situs memakai domain sendiri",
      done: !SITE.url.includes("workers.dev"),
      hint: "Masih di workers.dev. Ganti NEXT_PUBLIC_SITE_URL setelah domain WalDev aktif.",
    },
  ];

  const pending = checklist.filter((item) => !item.done).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Kepala halaman */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="label text-muted-foreground">Panel Admin</p>
          <h1 className="mt-3 text-3xl">Ringkasan</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Kabar aplikasi dan kelengkapan situs dalam satu tempat.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`${ADMIN_BASE}/apps/new`}>
            <Button variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Aplikasi
            </Button>
          </Link>
          <Link href={`${ADMIN_BASE}/articles/new`}>
            <Button variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Tulisan
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
      <div className="border-border bg-border grid grid-cols-2 gap-px border lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-background hover:bg-muted/60 flex flex-col gap-4 p-4 transition-colors duration-300 sm:gap-5 sm:p-5"
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors duration-300",
                  stat.alert
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "border-border text-muted-foreground group-hover:text-foreground",
                )}
              >
                <stat.icon className="h-4 w-4" aria-hidden />
              </span>
              <ArrowRight className="text-muted-foreground h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
            <div>
              <p className="text-4xl font-semibold">{stat.value}</p>
              <p className="label text-muted-foreground mt-2.5">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Menulis kabar dari halaman pertama panel, tanpa membuka aplikasinya dulu. */}
        <Panel title="Tulis catatan">
          {appOptions.length === 0 ? (
            <EmptyState>
              Belum ada aplikasi.{" "}
              <Link href={`${ADMIN_BASE}/apps/new`} className="text-foreground ml-1 underline">
                Buat yang pertama
              </Link>
            </EmptyState>
          ) : (
            <div className="p-5">
              <NoteComposer apps={appOptions} />
            </div>
          )}
        </Panel>

        <Panel title={`Perlu kabar · lebih dari ${NEEDS_UPDATE_AFTER_DAYS} hari`}>
          {needingUpdate.length === 0 ? (
            <EmptyState>
              Semua aplikasi yang sedang dibangun punya catatan dalam {NEEDS_UPDATE_AFTER_DAYS} hari
              terakhir.
            </EmptyState>
          ) : (
            <ul className="divide-border divide-y">
              {needingUpdate.map((app) => (
                <li key={app.id}>
                  <Link
                    href={`${ADMIN_BASE}/apps/${app.id}/edit`}
                    className="hover:bg-muted/60 flex items-center gap-4 px-5 py-3.5 transition-colors"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{app.name}</span>
                      <span className="label text-muted-foreground mt-1 block">
                        {app.lastActivityAt
                          ? `Catatan terakhir ${timeAgo(app.lastActivityAt)}`
                          : `Belum ada catatan sejak dibuat ${timeAgo(app.createdAt)}`}
                      </span>
                    </span>
                    <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Aplikasi terakhir diperbarui"
          action={{ label: "Semua aplikasi", href: `${ADMIN_BASE}/apps` }}
        >
          {apps.rows.length === 0 ? (
            <EmptyState>Belum ada aplikasi.</EmptyState>
          ) : (
            <ul className="divide-border divide-y">
              {apps.rows.slice(0, 5).map((app) => (
                <li key={app.id}>
                  <Link
                    href={`${ADMIN_BASE}/apps/${app.id}/edit`}
                    className="hover:bg-muted/60 flex items-center gap-4 px-5 py-3.5 transition-colors"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{app.name}</span>
                      <span className="label text-muted-foreground mt-1 block">
                        {app.isPublished ? "Tayang" : "Tersembunyi"} · {timeAgo(app.updatedAt)}
                      </span>
                    </span>
                    <Badge variant={statusTone(app.status)}>{statusLabel(app.status)}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Tulisan terakhir diperbarui"
          action={{ label: "Semua tulisan", href: `${ADMIN_BASE}/articles` }}
        >
          {articles.rows.length === 0 ? (
            <EmptyState>Belum ada tulisan.</EmptyState>
          ) : (
            <ul className="divide-border divide-y">
              {articles.rows.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`${ADMIN_BASE}/articles/${article.id}/edit`}
                    className="hover:bg-muted/60 flex items-center gap-4 px-5 py-3.5 transition-colors"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{article.title}</span>
                      <span className="label text-muted-foreground mt-1 block">
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
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={`Kelengkapan situs · ${checklist.length - pending} dari ${checklist.length}`}>
          <ul className="divide-border divide-y">
            {checklist.map((item) => (
              <li key={item.label}>
                <ChecklistRow item={item} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
