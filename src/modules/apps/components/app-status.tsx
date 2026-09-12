import { statusLabel } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { AppStatus } from "@/modules/apps/app.schema";

/**
 * Hanya "Sedang dibangun" yang diberi warna aksen: itu satu-satunya keadaan
 * yang masih bergerak. Rilis dan pensiun cukup dibaca sebagai teks.
 */
const TONE: Record<AppStatus, string> = {
  building: "text-link",
  released: "text-muted-foreground",
  retired: "text-faint",
};

/** Status aplikasi untuk situs publik. */
export function AppStatusText({ status, className }: { status: AppStatus; className?: string }) {
  return <span className={cn(TONE[status], className)}>{statusLabel(status)}</span>;
}
