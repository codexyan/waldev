import Link from "next/link";
import { Plus } from "lucide-react";
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
import { listArticlesAdmin } from "@/modules/articles/article.dal";
import { ArticleRowActions } from "@/modules/articles/components/article-row-actions";
import { requireSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  draft: "secondary",
  scheduled: "warning",
  published: "success",
} as const;

function formatDate(value: Date | null): string {
  if (!value) return "·";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(value);
}

export default async function ArticlesAdminPage() {
  await requireSession();
  const { rows, total } = await listArticlesAdmin({ limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Articles</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} artikel</p>
        </div>
        <Link href={`${ADMIN_BASE}/articles/new`}>
          <Button>
            <Plus className="h-4 w-4" />
            Artikel Baru
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Belum ada artikel.</p>
          <Link href={`${ADMIN_BASE}/articles/new`} className="mt-4 inline-block">
            <Button variant="outline">Buat artikel pertama</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Diperbarui</TableHead>
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
                  <TableCell className="text-muted-foreground">{row.categoryName ?? "·"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(row.updatedAt)}</TableCell>
                  <TableCell>
                    <ArticleRowActions id={row.id} />
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
