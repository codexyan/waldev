import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateContactStatusAction } from "@/modules/leads/lead.actions";
import { LeadStatusSelect } from "@/modules/leads/components/lead-status-select";
import { listContacts } from "@/modules/leads/lead.dal";
import { CONTACT_STATUSES } from "@/modules/leads/lead.schema";
import { requireSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null): string {
  if (!value) return "·";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(value);
}

export default async function ContactMessagesPage() {
  await requireSession();
  const rows = await listContacts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Pesan Masuk</h1>
        <p className="text-muted-foreground mt-1 text-sm">{rows.length} pesan</p>
      </div>

      {rows.length === 0 ? (
        <div className="border-border rounded-xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">Belum ada pesan.</p>
        </div>
      ) : (
        <div className="border-border rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dari</TableHead>
                <TableHead>Pesan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.name}
                    <span className="text-muted-foreground block text-xs">{row.email}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-md">
                    {row.subject ? (
                      <span className="text-foreground block font-medium">{row.subject}</span>
                    ) : null}
                    <span className="line-clamp-2 text-sm">{row.message}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </TableCell>
                  <TableCell>
                    <LeadStatusSelect
                      id={row.id}
                      status={row.status}
                      options={CONTACT_STATUSES}
                      onChange={updateContactStatusAction}
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
