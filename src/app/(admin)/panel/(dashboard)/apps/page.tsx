import Link from "next/link";
import { Plus } from "lucide-react";
import { EntityRowActions } from "@/components/admin/entity-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ADMIN_BASE } from "@/lib/constants";
import { formatDay } from "@/lib/date";
import { statusLabel, statusTone } from "@/lib/status";
import { deleteApp } from "@/modules/apps/app.actions";
import { listAppsAdmin } from "@/modules/apps/app.dal";
import { requireSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function AppsAdminPage() {
  await requireSession();
  const { rows, total } = await listAppsAdmin({ limit: 100 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Aplikasi</h1>
          <p className="text-muted-foreground mt-1 text-sm">{total} aplikasi di arsip</p>
        </div>
        <Link href={`${ADMIN_BASE}/apps/new`}>
          <Button>
            <Plus className="h-4 w-4" />
            Aplikasi Baru
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="border-border rounded-xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Belum ada aplikasi. Situs WalDev ini sendiri bisa jadi yang pertama.
          </p>
        </div>
      ) : (
        <div className="border-border rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Di situs</TableHead>
                <TableHead>Catatan terakhir</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <Link href={`${ADMIN_BASE}/apps/${row.id}/edit`} className="hover:underline">
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.isPublished ? "Tayang" : "Tersembunyi"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.lastActivityAt ? formatDay(row.lastActivityAt) : "Belum ada"}
                  </TableCell>
                  <TableCell>
                    <EntityRowActions
                      id={row.id}
                      editHref={`${ADMIN_BASE}/apps/${row.id}/edit`}
                      onDelete={deleteApp}
                      confirmText="Hapus aplikasi ini beserta catatan, fitur, FAQ, dan galerinya? Artikel terkait tidak ikut terhapus. Tindakan tidak dapat dibatalkan."
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
