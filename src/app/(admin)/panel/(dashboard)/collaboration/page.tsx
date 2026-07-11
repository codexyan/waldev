import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateCollaborationStatusAction } from "@/modules/leads/lead.actions";
import { LeadStatusSelect } from "@/modules/leads/components/lead-status-select";
import { listCollaborations } from "@/modules/leads/lead.dal";
import { COLLABORATION_STATUSES } from "@/modules/leads/lead.schema";
import { requireSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(value);
}

export default async function CollaborationAdminPage() {
  await requireSession();
  const rows = await listCollaborations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Collaboration Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">{rows.length} permintaan</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Belum ada permintaan kerja sama.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Proyek</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.name}
                    {row.company ? (
                      <span className="block text-xs text-muted-foreground">{row.company}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.projectType ?? "—"}
                    {row.budget ? (
                      <span className="block text-xs">{row.budget}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(row.createdAt)}</TableCell>
                  <TableCell>
                    <LeadStatusSelect
                      id={row.id}
                      status={row.status}
                      options={COLLABORATION_STATUSES}
                      onChange={updateCollaborationStatusAction}
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
