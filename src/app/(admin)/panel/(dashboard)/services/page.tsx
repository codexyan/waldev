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
import { deleteService } from "@/modules/services/service.actions";
import { listServicesAdmin } from "@/modules/services/service.dal";
import { requireSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function ServicesAdminPage() {
  await requireSession();
  const { rows, total } = await listServicesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} layanan</p>
        </div>
        <Link href={`${ADMIN_BASE}/services/new`}>
          <Button>
            <Plus className="h-4 w-4" />
            Layanan Baru
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Belum ada layanan.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "active" ? "success" : "secondary"}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.price ?? "·"}</TableCell>
                  <TableCell>
                    <EntityRowActions
                      id={row.id}
                      editHref={`${ADMIN_BASE}/services/${row.id}/edit`}
                      onDelete={deleteService}
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
