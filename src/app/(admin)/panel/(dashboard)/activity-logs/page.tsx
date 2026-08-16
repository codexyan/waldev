import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listActivityLogs } from "@/modules/activity/activity.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

function formatDateTime(value: Date | null): string {
  if (!value) return "·";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function ActivityLogsPage() {
  await requirePagePermission("activity.read");
  const rows = await listActivityLogs(150);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Log Aktivitas</h1>
        <p className="mt-1 text-sm text-muted-foreground">150 aktivitas terakhir.</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aksi</TableHead>
                <TableHead>Entitas</TableHead>
                <TableHead>Oleh</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.action}</TableCell>
                  <TableCell className="text-muted-foreground">{row.entityType ?? "·"}</TableCell>
                  <TableCell className="text-muted-foreground">{row.userName ?? "·"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(row.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
