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
  if (!value) return "·";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(value);
}

export default async function CollaborationAdminPage() {
  await requireSession();
  const rows = await listCollaborations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Permintaan Kerja Sama</h1>
        <p className="text-muted-foreground mt-1 text-sm">{rows.length} permintaan</p>
      </div>

      {rows.length === 0 ? (
        <div className="border-border rounded-xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">Belum ada permintaan kerja sama.</p>
        </div>
      ) : (
        <div className="border-border rounded-xl border">
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
                      <span className="text-muted-foreground block text-xs">{row.company}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.email}
                    {row.whatsapp ? (
                      <span className="block text-xs">WA: {row.whatsapp}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.projectType ?? "·"}
                    {row.budget || row.deadline ? (
                      <span className="block text-xs">
                        {[row.budget, row.deadline].filter(Boolean).join(" · ")}
                      </span>
                    ) : null}
                    {row.attachmentUrl ? (
                      <a
                        href={row.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary block text-xs hover:underline"
                      >
                        Lampiran ↓
                      </a>
                    ) : null}
                    {row.description ? (
                      <details className="mt-1">
                        <summary className="text-primary cursor-pointer text-xs font-medium">
                          Lihat brief
                        </summary>
                        <p className="border-border bg-muted/40 text-foreground mt-2 max-w-md rounded-lg border p-3 text-xs leading-relaxed whitespace-pre-line">
                          {row.description}
                        </p>
                      </details>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </TableCell>
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
