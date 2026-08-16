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
import { deletePortfolio } from "@/modules/portfolio/portfolio.actions";
import { listPortfoliosAdmin } from "@/modules/portfolio/portfolio.dal";
import { requireSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  ongoing: "warning",
  completed: "success",
  archived: "secondary",
} as const;

export default async function PortfolioAdminPage() {
  await requireSession();
  const { rows, total } = await listPortfoliosAdmin({ limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} proyek</p>
        </div>
        <Link href={`${ADMIN_BASE}/portfolio/new`}>
          <Button>
            <Plus className="h-4 w-4" />
            Proyek Baru
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Belum ada proyek.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Klien</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.isConfidential ? "Confidential" : (row.clientName ?? "·")}
                  </TableCell>
                  <TableCell>
                    <EntityRowActions
                      id={row.id}
                      editHref={`${ADMIN_BASE}/portfolio/${row.id}/edit`}
                      onDelete={deletePortfolio}
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
