import { ArrowRight } from "lucide-react";
import { StaticLink } from "@/components/ui/static-link";
import { formatMonthYear } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { AppStatus } from "@/modules/apps/app.schema";
import { AppStatusText } from "./app-status";

export interface AppCardItem {
  name: string;
  slug: string;
  tagline: string | null;
  status: AppStatus;
  coverUrl: string | null;
  logoUrl: string | null;
  lastActivityAt: Date | null;
}

/**
 * Dua huruf pengganti logo: huruf awal dua kata pertama ("SIM-KGB" jadi "SK"), atau
 * huruf awal dan huruf kapital berikutnya ("iaUndang" jadi "IU"). Satu huruf saja
 * sering terbaca sebagai garis, misalnya "I".
 */
function monogram(name: string): string {
  const words = name.trim().split(/[\s\-_.]+/).filter(Boolean);
  const first = words[0] ?? "";
  if (words.length >= 2) return `${first.charAt(0)}${(words[1] ?? "").charAt(0)}`.toUpperCase();
  const capital = first.slice(1).match(/[A-Z0-9]/)?.[0] ?? "";
  return `${first.charAt(0)}${capital}`.toUpperCase();
}

/** Logo aplikasi dalam ubin persegi. Selama logo belum diunggah, monogram menggantikannya. */
export function AppLogo({
  name,
  logoUrl,
  className,
  monogramClassName = "text-[1.125rem]",
}: {
  name: string;
  logoUrl: string | null;
  className?: string;
  monogramClassName?: string;
}) {
  return (
    <span
      className={cn(
        "border-border bg-card flex shrink-0 items-center justify-center overflow-hidden rounded-xl border",
        className,
      )}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-2"
        />
      ) : (
        <span aria-hidden className={cn("display-sm text-link tracking-tight", monogramClassName)}>
          {monogram(name)}
        </span>
      )}
    </span>
  );
}

/**
 * Kartu aplikasi di beranda (docs/09 §5.1): tangkapan layar, logo yang menumpang di
 * tepi bawahnya, nama, satu kalimat, status, dan bulan catatan terakhir.
 * `wide` dipakai saat baru ada satu aplikasi: tangkapan layar di kiri, keterangan di
 * kanan, supaya kartunya tidak berdiri sendirian di sepertiga lebar.
 */
export function AppCard({ app, wide = false }: { app: AppCardItem; wide?: boolean }) {
  return (
    <StaticLink
      href={`/apps/${app.slug}`}
      className={cn(
        "group border-border bg-card hover:border-primary/40 flex h-full flex-col overflow-hidden rounded-xl border transition-colors",
        wide && "md:flex-row",
      )}
    >
      {/* Di kartu lebar, kolom keterangan bisa lebih tinggi daripada tangkapan layar.
          Gambarnya diberi bingkai berjarak dan diletakkan di tengah kolom, supaya tidak
          ikut memanjang lalu terpotong. */}
      <div
        className={cn(
          "bg-surface border-border border-b",
          wide && "md:flex md:w-[58%] md:shrink-0 md:items-center md:border-r md:border-b-0 md:p-6",
        )}
      >
        <div
          className={cn(
            // 16:9 mengikuti ukuran tangkapan layar yang paling umum.
            "relative aspect-[16/9] w-full overflow-hidden",
            wide && "md:border-border md:rounded-lg md:border",
          )}
        >
          {app.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={app.coverUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                "h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                app.status === "retired" && "opacity-80 grayscale",
              )}
            />
          ) : (
            <span className="flex h-full items-center justify-center">
              <AppLogo
                name={app.name}
                logoUrl={app.logoUrl}
                className="h-20 w-20 rounded-2xl"
                monogramClassName="text-[1.75rem]"
              />
            </span>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col px-5 pb-5",
          !app.coverUrl && "pt-5",
          wide && "md:justify-center md:p-10",
        )}
      >
        {app.coverUrl ? (
          <AppLogo
            name={app.name}
            logoUrl={app.logoUrl}
            className={cn(
              "ring-card relative -mt-7 h-14 w-14 ring-4",
              wide && "md:mt-0 md:h-16 md:w-16 md:ring-0",
            )}
            monogramClassName={wide ? "text-[1.125rem] md:text-[1.375rem]" : undefined}
          />
        ) : null}
        <h3
          className={cn(
            "display-sm group-hover:text-link text-lg text-balance transition-colors",
            app.coverUrl ? "mt-4" : "mt-0",
            wide && "md:mt-6 md:text-[1.75rem]",
          )}
        >
          {app.name}
        </h3>
        {app.tagline ? (
          <p
            className={cn(
              "text-muted-foreground mt-1.5 leading-relaxed text-pretty",
              wide ? "line-clamp-3 md:mt-3 md:line-clamp-none md:text-[0.9375rem]" : "line-clamp-2",
            )}
          >
            {app.tagline}
          </p>
        ) : null}
        <p
          className={cn(
            "flex flex-wrap items-center gap-x-2 gap-y-1 pt-5 text-xs",
            wide ? "mt-auto md:mt-0" : "mt-auto",
          )}
        >
          <AppStatusText status={app.status} className="font-medium" />
          <span aria-hidden className="text-faint">
            ·
          </span>
          <span className="text-faint">
            {app.lastActivityAt
              ? `Diperbarui ${formatMonthYear(app.lastActivityAt)}`
              : "Belum ada catatan"}
          </span>
        </p>
        {wide ? (
          <span className="text-link mt-6 hidden items-center gap-1.5 font-medium md:inline-flex">
            Lihat aplikasi
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden
            />
          </span>
        ) : null}
      </div>
    </StaticLink>
  );
}
